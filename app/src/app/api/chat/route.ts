import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import {
  createConversation,
  getConversation,
  createMessage,
  getMessages,
  touchConversation,
  updateConversationTitle,
  logAudit,
} from "@/lib/db";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { getToolsForRole, executeTool } from "@/lib/ai/tools";

const ChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(10000),
});

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = ChatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid input", details: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { message } = parsed.data;
  let { conversationId } = parsed.data;
  const role = session.role as "owner" | "household";

  try {
    // Create or load conversation
    let isNew = false;
    if (!conversationId) {
      const conv = await createConversation(session.user_id);
      conversationId = conv.id;
      isNew = true;
    } else {
      const conv = await getConversation(conversationId, session.user_id);
      if (!conv) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Save user message
    await createMessage(conversationId, "user", message);
    await touchConversation(conversationId);

    // Load conversation history (last 20 messages)
    const history = await getMessages(conversationId, 40);
    const claudeMessages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Build system prompt and tools
    const systemPrompt = buildSystemPrompt(role);
    const tools = getToolsForRole(role);

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(event: string, data: unknown) {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        }

        try {
          let fullResponse = "";
          let allToolCalls: unknown[] = [];
          let currentMessages = [...claudeMessages];

          // Loop to handle tool use
          let continueLoop = true;
          while (continueLoop) {
            continueLoop = false;

            const response = client.messages.stream({
              model: "claude-opus-4-20250514",
              max_tokens: 4096,
              system: systemPrompt,
              messages: currentMessages,
              tools,
            });

            let toolUseBlocks: Array<{
              id: string;
              name: string;
              input: Record<string, unknown>;
            }> = [];
            let currentToolId = "";
            let currentToolName = "";
            let currentToolInput = "";

            for await (const event of response) {
              if (event.type === "content_block_start") {
                if (event.content_block.type === "text") {
                  // Text block starting
                } else if (event.content_block.type === "tool_use") {
                  currentToolId = event.content_block.id;
                  currentToolName = event.content_block.name;
                  currentToolInput = "";
                  send("tool_use", { tool: currentToolName });
                }
              } else if (event.type === "content_block_delta") {
                if (event.delta.type === "text_delta") {
                  fullResponse += event.delta.text;
                  send("token", { text: event.delta.text });
                } else if (event.delta.type === "input_json_delta") {
                  currentToolInput += event.delta.partial_json;
                }
              } else if (event.type === "content_block_stop") {
                if (currentToolName) {
                  let parsedInput: Record<string, unknown> = {};
                  try {
                    parsedInput = currentToolInput
                      ? JSON.parse(currentToolInput)
                      : {};
                  } catch {
                    parsedInput = {};
                  }
                  toolUseBlocks.push({
                    id: currentToolId,
                    name: currentToolName,
                    input: parsedInput,
                  });
                  currentToolName = "";
                  currentToolInput = "";
                  currentToolId = "";
                }
              } else if (event.type === "message_stop") {
                // Check if we need to handle tool calls
              }
            }

            const finalMessage = await response.finalMessage();

            // Handle tool use
            if (finalMessage.stop_reason === "tool_use" && toolUseBlocks.length > 0) {
              continueLoop = true;
              allToolCalls.push(...toolUseBlocks);

              // Build assistant message with content blocks
              const assistantContent: Anthropic.ContentBlockParam[] = [];
              if (fullResponse) {
                assistantContent.push({ type: "text", text: fullResponse });
              }
              for (const tb of toolUseBlocks) {
                assistantContent.push({
                  type: "tool_use",
                  id: tb.id,
                  name: tb.name,
                  input: tb.input,
                });
              }

              currentMessages.push({
                role: "assistant",
                content: assistantContent,
              });

              // Execute tools and add results
              const toolResults: Anthropic.ToolResultBlockParam[] = [];
              for (const tb of toolUseBlocks) {
                const result = await executeTool(
                  tb.name,
                  tb.input,
                  role,
                  session.user_id
                );
                send("tool_result", {
                  tool: tb.name,
                  result: JSON.parse(result),
                });
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tb.id,
                  content: result,
                });
              }

              currentMessages.push({
                role: "user",
                content: toolResults,
              });

              // Reset for next iteration
              fullResponse = "";
              toolUseBlocks = [];
            }
          }

          // Save assistant message
          const savedMsg = await createMessage(
            conversationId!,
            "assistant",
            fullResponse,
            allToolCalls.length > 0 ? allToolCalls : undefined
          );

          // Auto-title new conversations
          if (isNew && fullResponse) {
            try {
              const titleResponse = await client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 30,
                messages: [
                  {
                    role: "user",
                    content: `Generate a concise 3-5 word title for a conversation that starts with this message: "${message}". Return ONLY the title, no quotes or punctuation.`,
                  },
                ],
              });
              const title =
                titleResponse.content[0].type === "text"
                  ? titleResponse.content[0].text.trim()
                  : "New Conversation";
              await updateConversationTitle(conversationId!, title);
              send("title", { title, conversationId });
            } catch {
              // Title generation failed, not critical
            }
          }

          send("done", {
            messageId: savedMsg.id,
            conversationId,
          });

          await logAudit(
            session.user_id,
            "chat_message",
            "chat",
            `conv: ${conversationId}`,
            req.headers.get("x-forwarded-for") || undefined
          );
        } catch (error) {
          console.error("Chat stream error:", error);
          send("error", {
            error:
              error instanceof Error ? error.message : "Chat failed",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Chat failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
