"use client";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface LeftSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export default function LeftSidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: LeftSidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col h-full w-64 py-6 px-4 gap-2"
      style={{ background: "var(--surface-container-low)" }}
    >
      {/* Warren AI Badge */}
      <div className="mb-6 px-2">
        <h3
          className="text-xs font-bold uppercase tracking-widest opacity-60"
          style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}
        >
          Intelligence
        </h3>
        <div
          className="mt-4 flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "var(--surface-container)" }}
        >
          <div
            className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <div>
            <p className="text-xs font-bold leading-none" style={{ color: "var(--on-surface)" }}>
              Warren AI
            </p>
            <p className="text-[10px] mt-1" style={{ color: "var(--on-surface-variant)" }}>
              Financial Advisor
            </p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
        style={{
          background: "var(--surface-container)",
          color: "var(--primary)",
          fontFamily: "var(--font-display)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--surface-container-high)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--surface-container)")
        }
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Analysis
      </button>

      {/* Conversation List */}
      <nav className="flex-1 overflow-y-auto mt-2 space-y-0.5">
        {conversations.length === 0 && (
          <p
            className="text-xs text-center mt-8 px-4"
            style={{ color: "var(--on-surface-muted)" }}
          >
            Start a conversation with Warren about your finances.
          </p>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="group flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all"
            style={{
              background:
                activeId === conv.id
                  ? "var(--surface-container)"
                  : "transparent",
              color:
                activeId === conv.id
                  ? "var(--primary)"
                  : "var(--on-surface-variant)",
            }}
            onClick={() => onSelect(conv.id)}
            onMouseEnter={(e) => {
              if (activeId !== conv.id)
                e.currentTarget.style.background = "var(--surface-container)";
            }}
            onMouseLeave={(e) => {
              if (activeId !== conv.id)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              className="w-4 h-4 shrink-0 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span
              className="text-sm truncate flex-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {conv.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--on-surface-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
              title="Delete"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="mt-auto space-y-1 pt-4">
        <a
          href="/overview"
          className="flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors rounded-lg"
          style={{ color: "var(--on-surface-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </a>
      </div>
    </aside>
  );
}
