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
    <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col h-full overflow-hidden">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-8 px-4">
            Start a conversation with Warren about your finances.
          </p>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors ${
              activeId === conv.id
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
            }`}
            onClick={() => onSelect(conv.id)}
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
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-sm truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
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
      </div>
    </aside>
  );
}
