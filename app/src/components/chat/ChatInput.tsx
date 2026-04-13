"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div
      className="absolute bottom-0 left-0 w-full p-6"
      style={{
        background: "linear-gradient(to top, var(--surface) 60%, transparent)",
      }}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Main Input */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Warren anything about your finances..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none disabled:opacity-50"
            style={{
              background: "var(--surface-container-highest)",
              color: "var(--on-surface)",
              border: "none",
              boxShadow: "0 4px 40px rgba(11, 28, 48, 0.2)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 2px rgba(183, 196, 255, 0.3), 0 4px 40px rgba(11, 28, 48, 0.2)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 40px rgba(11, 28, 48, 0.2)")
            }
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
