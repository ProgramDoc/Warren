"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isStreaming,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex gap-4 items-start max-w-2xl ml-auto flex-row-reverse mb-8">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--primary)" }}
        >
          <svg className="w-4 h-4" fill="var(--on-primary)" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface-container)" }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--on-surface)" }}>
            {content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start max-w-2xl mb-8">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--surface-container-highest)" }}
      >
        <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
          W
        </span>
      </div>
      <div className="space-y-2 flex-1">
        <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--on-surface-variant)" }}>
          {content}
          {isStreaming && (
            <span
              className="inline-block w-1.5 h-4 ml-0.5 cursor-blink"
              style={{ background: "var(--primary)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
