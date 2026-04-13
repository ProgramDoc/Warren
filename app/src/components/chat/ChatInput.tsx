"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/heic",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);
const MAX_SIZE = 10 * 1024 * 1024;

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if ((!trimmed && attachedFiles.length === 0) || disabled) return;
    onSend(trimmed || "I've attached files for review.", attachedFiles.length > 0 ? attachedFiles : undefined);
    setValue("");
    setAttachedFiles([]);
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        alert(`File type not allowed: ${file.name}. Allowed: PDF, PNG, JPG, HEIC, XLSX, CSV`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        alert(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB`);
        continue;
      }
      valid.push(file);
    }

    setAttachedFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return (
    <div
      className="absolute bottom-0 left-0 w-full p-6"
      style={{
        background: "linear-gradient(to top, var(--surface) 60%, transparent)",
      }}
    >
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {attachedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: "var(--surface-container-high)",
                  color: "var(--on-surface-variant)",
                }}
              >
                <svg className="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate max-w-[120px]">{file.name}</span>
                <span className="opacity-50">{formatSize(file.size)}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--accent-red)" }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input */}
        <div className="relative group">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.heic,.xlsx,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Paperclip button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-30"
            style={{ color: "var(--on-surface-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Warren anything about your finances..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-full py-4 pl-14 pr-14 text-sm focus:outline-none disabled:opacity-50"
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
            disabled={disabled || (!value.trim() && attachedFiles.length === 0)}
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
