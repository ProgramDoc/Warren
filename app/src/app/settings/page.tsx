"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlaidLinkButton from "@/components/PlaidLinkButton";

interface PlaidItemInfo {
  id: number;
  institution_name: string | null;
  products: string[];
  status: string;
  error_code: string | null;
  updated_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [rawSecret, setRawSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email: string; displayName: string; role: string } | null>(null);
  const [plaidItems, setPlaidItems] = useState<PlaidItemInfo[]>([]);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [includeInvestments, setIncludeInvestments] = useState(false);

  const loadPlaidItems = useCallback(async () => {
    try {
      const res = await fetch("/api/plaid/items");
      if (res.ok) {
        const data = await res.json();
        setPlaidItems(data.items || []);
      }
    } catch {}
  }, []);

  async function handleSync(itemId: number) {
    setSyncing(itemId);
    try {
      await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });
      await loadPlaidItems();
    } catch {}
    setSyncing(null);
  }

  async function handleDisconnect(itemId: number) {
    if (!confirm("Disconnect this account? Synced transactions will remain.")) return;
    await fetch("/api/plaid/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId }),
    });
    await loadPlaidItems();
  }

  useEffect(() => {
    // Check auth and get user info
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        if (data.user?.role === "owner") loadPlaidItems();
      });
  }, [router, loadPlaidItems]);

  async function handleStartSetup() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup-2fa");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setQrCodeUrl(data.qrCodeUrl);
      setRawSecret(data.secret);
      setTotpEnabled(data.totpEnabled);
      setShowSetup(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start 2FA setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndEnable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode, secret: rawSecret }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setTotpEnabled(true);
      setShowSetup(false);
      setQrCodeUrl("");
      setRawSecret("");
      setVerifyCode("");
      setMessage("Two-factor authentication is now enabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable 2FA");
      setVerifyCode("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable2FA() {
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup-2fa", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setTotpEnabled(false);
      setMessage("Two-factor authentication has been disabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            {user && <p className="text-sm text-gray-400">{user.email}</p>}
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        {/* 2FA Section */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-400 mt-1">
                Add an extra layer of security using Duo Mobile, Microsoft Authenticator, or any TOTP app.
              </p>
            </div>
            {totpEnabled && (
              <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-xs font-medium">
                Enabled
              </span>
            )}
          </div>

          {message && (
            <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {!showSetup && !totpEnabled && (
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              {loading ? "Loading..." : "Set Up 2FA"}
            </button>
          )}

          {!showSetup && totpEnabled && (
            <div className="flex gap-3">
              <button
                onClick={handleStartSetup}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
              >
                Reconfigure
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="bg-red-900/50 hover:bg-red-900 text-red-300 font-medium py-2.5 px-5 rounded-lg transition-colors border border-red-800"
              >
                Disable 2FA
              </button>
            </div>
          )}

          {showSetup && (
            <div className="space-y-6 mt-4">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-medium mb-3">Step 1: Scan QR Code</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Open your authenticator app and scan this QR code:
                </p>
                <div className="flex justify-center bg-white rounded-lg p-4 w-fit mx-auto">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                  )}
                </div>
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                    Can&apos;t scan? Enter this key manually
                  </summary>
                  <code className="block mt-2 bg-gray-900 px-4 py-2 rounded text-sm font-mono text-blue-400 break-all select-all">
                    {rawSecret}
                  </code>
                </details>
              </div>

              <form onSubmit={handleVerifyAndEnable} className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-medium mb-3">Step 2: Verify Code</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Enter the 6-digit code from your authenticator app to confirm setup:
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 rounded-lg bg-gray-900 border border-gray-700 text-white text-center text-xl tracking-[0.4em] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                  <button
                    type="submit"
                    disabled={loading || verifyCode.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {loading ? "Verifying..." : "Enable 2FA"}
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => {
                  setShowSetup(false);
                  setQrCodeUrl("");
                  setRawSecret("");
                  setVerifyCode("");
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                Cancel setup
              </button>
            </div>
          )}
        </section>

        {/* Connected Accounts (Owner Only) */}
        {user?.role === "owner" && (
          <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Connected Accounts</h2>
              <p className="text-sm text-gray-400 mt-1">
                Link your bank accounts, credit cards, and investment accounts for automatic transaction sync.
              </p>
            </div>

            {/* Connected institutions */}
            {plaidItems.length > 0 && (
              <div className="space-y-3 mb-5">
                {plaidItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ background: "var(--surface-container)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--surface-container-high)" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--primary)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                          {item.institution_name || "Connected Account"}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--on-surface-muted)" }}>
                          {item.products.join(", ")} · Last synced{" "}
                          {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: item.status === "active" ? "rgba(122, 232, 160, 0.15)" : "rgba(255, 123, 123, 0.15)",
                          color: item.status === "active" ? "var(--accent-green)" : "var(--accent-red)",
                        }}
                      >
                        {item.status}
                      </span>
                      <button
                        onClick={() => handleSync(item.id)}
                        disabled={syncing === item.id}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "var(--surface-container-high)", color: "var(--primary)" }}
                      >
                        {syncing === item.id ? "Syncing..." : "Sync"}
                      </button>
                      <button
                        onClick={() => handleDisconnect(item.id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--accent-red)" }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {plaidItems.length === 0 && (
              <p className="text-sm mb-5" style={{ color: "var(--on-surface-muted)" }}>
                No accounts connected yet. Click below to get started.
              </p>
            )}

            {/* Include investments toggle */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInvestments}
                onChange={(e) => setIncludeInvestments(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                Include investment accounts (Schwab, Fidelity, Vanguard, etc.)
              </span>
            </label>

            <PlaidLinkButton
              products={includeInvestments ? ["transactions", "investments"] : ["transactions"]}
              onSuccess={loadPlaidItems}
            />
          </section>
        )}

        {/* Account info */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-3">Account</h2>
          {user && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
