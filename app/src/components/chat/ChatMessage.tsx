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
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-bold">W</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Warren</span>
        </div>
        <div className="bg-gray-800 text-gray-200 px-4 py-3 rounded-2xl rounded-tl-md text-sm leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
