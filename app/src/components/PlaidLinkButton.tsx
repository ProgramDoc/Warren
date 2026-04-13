"use client";

import { useState, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkButtonProps {
  products: string[];
  onSuccess: () => void;
}

export default function PlaidLinkButton({ products, onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    setStatus("Preparing connection...");
    try {
      const res = await fetch("/api/plaid/link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      if (!res.ok) throw new Error("Failed to get link token");
      const data = await res.json();
      setLinkToken(data.link_token);
      setStatus(null);
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
      setLoading(false);
    }
  }, [products]);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: { institution?: { institution_id?: string; name?: string } | null }) => {
      setStatus("Connecting and syncing...");
      try {
        const res = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            institution: metadata.institution
              ? { institution_id: metadata.institution.institution_id, name: metadata.institution.name }
              : null,
            products,
          }),
        });
        if (!res.ok) throw new Error("Failed to connect");
        const data = await res.json();
        setStatus(`Connected ${data.institution || "account"}!`);
        setTimeout(() => {
          setStatus(null);
          setLoading(false);
          setLinkToken(null);
          onSuccess();
        }, 1500);
      } catch (e) {
        setStatus(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
        setLoading(false);
      }
    },
    [products, onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => {
      setLoading(false);
      setStatus(null);
      setLinkToken(null);
    },
  });

  // Auto-open when link token is ready
  if (linkToken && ready && loading && !status?.startsWith("Connecting")) {
    open();
  }

  return (
    <div>
      <button
        onClick={fetchLinkToken}
        disabled={loading}
        className="flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-all"
        style={{
          background: loading ? "var(--surface-container-high)" : "var(--surface-container)",
          color: "var(--primary)",
          fontFamily: "var(--font-display)",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = "var(--surface-container-high)";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.background = "var(--surface-container)";
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {loading ? "Connecting..." : "Connect New Account"}
      </button>
      {status && (
        <p className="text-xs mt-2 px-1" style={{ color: status.startsWith("Error") ? "var(--accent-red)" : "var(--on-surface-variant)" }}>
          {status}
        </p>
      )}
    </div>
  );
}
