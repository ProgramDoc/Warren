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
    <header
      className="h-16 flex items-center justify-between px-6 shrink-0"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex items-center gap-8">
        <button
          onClick={onNewChat}
          className="text-2xl font-bold tracking-tighter font-headline transition-colors"
          style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}
        >
          Warren
        </button>
      </div>

      <div className="flex items-center gap-4">
        {userName && (
          <span
            className="text-xs font-medium"
            style={{ color: "var(--on-surface-variant)" }}
          >
            {userName}
          </span>
        )}
        <button
          onClick={() => router.push("/settings")}
          className="p-2 rounded-full transition-all"
          style={{ color: "var(--on-surface-variant)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--surface-container)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={handleLogout}
          className="text-xs font-medium px-4 py-2 rounded-full transition-all"
          style={{
            color: "var(--on-surface-variant)",
            background: "var(--surface-container)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--surface-container-high)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--surface-container)")
          }
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
