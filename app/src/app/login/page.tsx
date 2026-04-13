"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [pendingToken, setPendingToken] = useState("");
  const totpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) router.push("/");
        else if (data.needsSetup) router.push("/setup");
      });
  }, [router]);

  useEffect(() => {
    if (step === "totp") totpInputRef.current?.focus();
  }, [step]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: Record<string, string> = { email, password };
      if (step === "totp" && totpCode) payload.totpCode = totpCode;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.requiresTotp) {
        setPendingToken(data.pendingToken);
        setStep("totp");
        setTotpCode("");
        return;
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      if (step === "totp") setTotpCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>W</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>
            Warren
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--on-surface-variant)" }}>Financial Advisor</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {step === "credentials" && (
            <>
              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--on-surface-variant)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                  style={{
                    background: "var(--surface-container-high)",
                    color: "var(--on-surface)",
                    border: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(183, 196, 255, 0.3)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--on-surface-variant)" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                  style={{
                    background: "var(--surface-container-high)",
                    color: "var(--on-surface)",
                    border: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(183, 196, 255, 0.3)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  required
                />
              </div>
            </>
          )}

          {step === "totp" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-container-high)" }}>
                <svg className="w-6 h-6" fill="none" stroke="var(--primary)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--on-surface)" }}>Two-factor authentication</p>
              <p className="text-xs mb-6" style={{ color: "var(--on-surface-muted)" }}>Enter the 6-digit code from your authenticator app</p>
              <input
                ref={totpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none"
                style={{
                  background: "var(--surface-container-high)",
                  color: "var(--on-surface)",
                  border: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(183, 196, 255, 0.3)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                autoComplete="one-time-code"
                required
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(255, 123, 123, 0.1)", color: "var(--accent-red)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (step === "credentials" && (!email || !password)) || (step === "totp" && totpCode.length !== 6)}
            className="w-full gradient-primary font-medium py-3 px-4 rounded-lg text-sm transition-all hover:opacity-90 disabled:opacity-30"
            style={{ color: "var(--on-primary-fixed)" }}
          >
            {loading ? "Verifying..." : step === "totp" ? "Verify" : "Sign In"}
          </button>

          {step === "totp" && (
            <button
              type="button"
              onClick={() => { setStep("credentials"); setTotpCode(""); setError(""); }}
              className="w-full text-xs py-2 transition-colors"
              style={{ color: "var(--on-surface-muted)" }}
            >
              Back to sign in
            </button>
          )}
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest" style={{ color: "var(--on-surface-muted)" }}>
          AES-256-GCM Encrypted
        </p>
      </div>
    </div>
  );
}
