"use client";

import { useRouter } from "next/navigation";

interface TopNavProps {
  userName?: string;
  onNewChat: () => void;
}

export default function TopNav({ userName, onNewChat }: TopNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-12 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 text-white font-semibold hover:text-blue-400 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span className="text-lg">Warren</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-xs text-gray-500">{userName}</span>
        )}
        <button
          onClick={() => router.push("/settings")}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
