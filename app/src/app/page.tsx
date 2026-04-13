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
  user_id: string;
  shared_with: string | null;
  project_id: string | null;
}

interface Project {
  id: string;
  name: string;
  position: number;
}

const QUICK_PROMPTS = [
  "What's my budget status?",
  "Show my income YTD",
  "Upcoming tax deadlines",
  "What are my recurring bills?",
];

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    displayName: string;
    role: string;
  } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push(data.needsSetup ? "/setup" : "/login");
          return;
        }
        setUser({ id: data.user.id, displayName: data.user.displayName, role: data.user.role });
      });
  }, [router]);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadProjects();
    }
  }, [user, loadConversations, loadProjects]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function selectConversation(id: string) {
    setActiveConversationId(id);
    const res = await fetch(`/api/conversations?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent("");
  }

  async function handleDeleteConversation(id: string) {
    await fetch(`/api/conversations?id=${id}`, { method: "DELETE" });
    if (activeConversationId === id) startNewChat();
    loadConversations();
  }

  async function handleRenameConversation(id: string, title: string) {
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }

  async function handleShareConversation(id: string, shareWithUserId: string | null) {
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, shareWith: shareWithUserId }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, shared_with: shareWithUserId } : c))
    );
  }

  async function handleCreateProject(name: string) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects((prev) => [...prev, data.project]);
    }
  }

  async function handleRenameProject(id: string, name: string) {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }

  async function handleDeleteProject(id: string) {
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConversations((prev) =>
      prev.map((c) => (c.project_id === id ? { ...c, project_id: null } : c))
    );
  }

  async function handleMoveConversation(conversationId: string, projectId: string | null) {
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId, projectId }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, project_id: projectId } : c))
    );
  }

  async function sendMessage(content: string) {
    if (isStreaming) return;

    const userMsg: Message = { id: "temp-" + Date.now(), role: "user", content };
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
                setToolStatus(data.tool.replace(/_/g, " "));
                break;
              case "tool_result":
                setToolStatus(null);
                break;
              case "title":
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === data.conversationId ? { ...c, title: data.title } : c
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

      if (fullText) {
        setMessages((prev) => [
          ...prev,
          { id: "msg-" + Date.now(), role: "assistant", content: fullText },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `I encountered an issue: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="ai-thinking w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--surface)" }}>
      <TopNav userName={user.displayName} onNewChat={startNewChat} />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          conversations={conversations}
          projects={projects}
          activeId={activeConversationId}
          currentUserId={user.id}
          onSelect={selectConversation}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
          onShare={handleShareConversation}
          onNewChat={startNewChat}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onMoveConversation={handleMoveConversation}
        />

        {/* Center Chat Pane */}
        <section className="flex-1 flex flex-col h-full relative">
          {/* Chat Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
            >
              {activeConversationId
                ? conversations.find((c) => c.id === activeConversationId)?.title || "Conversation"
                : "New Analysis"}
            </h2>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 pb-40">
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 && !isStreaming && (
                <div className="text-center mt-[18vh]">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      W
                    </span>
                  </div>
                  <h2
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
                  >
                    How can I help with your finances?
                  </h2>
                  <p className="text-sm max-w-md mx-auto mb-8" style={{ color: "var(--on-surface-variant)" }}>
                    I can analyze your budget, track income, review tax deadlines, project cash flow, and log expenses.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="px-4 py-2 rounded-full text-xs font-medium transition-all ghost-border"
                        style={{
                          background: "var(--surface-container)",
                          color: "var(--on-surface-variant)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--surface-container-high)";
                          e.currentTarget.style.color = "var(--on-surface)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--surface-container)";
                          e.currentTarget.style.color = "var(--on-surface-variant)";
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}

              {isStreaming && streamingContent && (
                <ChatMessage role="assistant" content={streamingContent} isStreaming />
              )}

              {toolStatus && (
                <div className="flex gap-4 items-start max-w-2xl mb-8">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--surface-container-highest)" }}
                  >
                    <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>W</span>
                  </div>
                  <div
                    className="glass rounded-xl p-4 flex items-center gap-4"
                    style={{ border: "1px solid rgba(183, 196, 255, 0.1)" }}
                  >
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--primary)" }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                      {toolStatus}...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </section>

        {/* Right Pane — Phase 3 */}
        <section
          className="hidden xl:flex flex-col h-full w-0 overflow-hidden transition-all duration-300"
          style={{ background: "var(--surface-container-low)" }}
        />
      </div>
    </div>
  );
}
