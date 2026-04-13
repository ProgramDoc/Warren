"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    displayName: string;
    role: string;
  } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push(data.needsSetup ? "/setup" : "/login");
          return;
        }
        setUser(data.user);
      });
  }, [router]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations);
    }
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Load conversation messages
  async function selectConversation(id: string) {
    setActiveConversationId(id);
    const res = await fetch(`/api/conversations?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  // Start new chat
  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent("");
  }

  // Delete conversation
  async function deleteConversation(id: string) {
    await fetch(`/api/conversations?id=${id}`, { method: "DELETE" });
    if (activeConversationId === id) {
      startNewChat();
    }
    loadConversations();
  }

  // Send message
  async function sendMessage(content: string) {
    if (isStreaming) return;

    // Add user message to UI
    const userMsg: Message = {
      id: "temp-" + Date.now(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent("");
    setToolStatus(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Chat failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7);
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            switch (eventType) {
              case "token":
                fullText += data.text;
                setStreamingContent(fullText);
                break;
              case "tool_use":
                setToolStatus(`Querying ${data.tool.replace(/_/g, " ")}...`);
                break;
              case "tool_result":
                setToolStatus(null);
                break;
              case "title":
                // Update conversation title in sidebar
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === data.conversationId
                      ? { ...c, title: data.title }
                      : c
                  )
                );
                break;
              case "done":
                if (!activeConversationId && data.conversationId) {
                  setActiveConversationId(data.conversationId);
                }
                break;
              case "error":
                console.error("Stream error:", data.error);
                break;
            }
          }
        }
      }

      // Add assistant message
      if (fullText) {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-" + Date.now(),
            role: "assistant",
            content: fullText,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `Sorry, something went wrong: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      setToolStatus(null);
      loadConversations();
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      <TopNav userName={user.displayName} onNewChat={startNewChat} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={selectConversation}
          onDelete={deleteConversation}
          onNewChat={startNewChat}
        />

        {/* Center Chat Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 && !isStreaming && (
                <div className="text-center mt-[20vh]">
                  <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-400 text-2xl font-bold">
                      W
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-300 mb-2">
                    How can I help with your finances?
                  </h2>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Ask about your budget, income, tax deadlines, cash flow, or
                    log an expense. I can pull up your financial data and provide
                    analysis.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {[
                      "What's my budget status?",
                      "Show my income YTD",
                      "Upcoming tax deadlines",
                      "What are my recurring bills?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-xs transition-colors border border-gray-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                />
              ))}

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <ChatMessage
                  role="assistant"
                  content={streamingContent}
                  isStreaming
                />
              )}

              {/* Tool status */}
              {toolStatus && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs mb-4">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {toolStatus}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
