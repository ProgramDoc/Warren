"use client";

interface Attachment {
  id: string;
  filename: string;
  size: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  attachments?: Attachment[];
}

// Parse markdown-style links [text](url) into clickable elements
function renderContent(content: string) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts: Array<{ type: "text" | "link"; text: string; url?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "link", text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", text: content.slice(lastIndex) });
  }

  if (parts.length === 0) return content;

  return parts.map((part, i) => {
    if (part.type === "link") {
      return (
        <a
          key={i}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: "var(--surface-container-high)",
            color: "var(--primary)",
            border: "1px solid rgba(183, 196, 255, 0.15)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-container-highest)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-container-high)")}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {part.text}
        </a>
      );
    }
    return <span key={i}>{part.text}</span>;
  });
}

export default function ChatMessage({
  role,
  content,
  isStreaming,
  attachments,
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
        <div className="space-y-2">
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface-container)" }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--on-surface)" }}>
              {content}
            </p>
          </div>
          {/* File attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px]"
                  style={{
                    background: "var(--surface-container-high)",
                    color: "var(--on-surface-muted)",
                  }}
                >
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate max-w-[100px]">{att.filename}</span>
                  <span className="opacity-50">{att.size}</span>
                </div>
              ))}
            </div>
          )}
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
          {renderContent(content)}
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
