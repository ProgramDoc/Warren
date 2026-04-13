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
        if (data.authenticated) {
          router.push("/");
        } else if (data.needsSetup) {
          router.push("/setup");
        }
      });
  }, [router]);

  // Auto-focus TOTP input when step changes
  useEffect(() => {
    if (step === "totp") {
      totpInputRef.current?.focus();
    }
  }, [step]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: Record<string, string> = { email, password };
      if (step === "totp" && totpCode) {
        payload.totpCode = totpCode;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // 2FA required — show TOTP input
      if (data.requiresTotp) {
        setPendingToken(data.pendingToken);
        setStep("totp");
        setTotpCode("");
        return;
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      if (step === "totp") {
        setTotpCode("");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("credentials");
    setTotpCode("");
    setPendingToken("");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Warren</h1>
          <p className="text-gray-400 mt-2">Financial Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {step === "credentials" && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tom@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </>
          )}

          {step === "totp" && (
            <>
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/50 mb-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">
                  Enter the 6-digit code from your authenticator app
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Duo Mobile, Microsoft Authenticator, or Google Authenticator
                </p>
              </div>

              <div>
                <input
                  ref={totpInputRef}
                  id="totpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="block w-full rounded-lg bg-gray-800 border border-gray-700 text-white text-center text-2xl tracking-[0.5em] px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="000000"
                  required
                  autoComplete="one-time-code"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (step === "credentials" && (!email || !password)) || (step === "totp" && totpCode.length !== 6)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? "Verifying..." : step === "totp" ? "Verify" : "Sign In"}
          </button>

          {step === "totp" && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full text-gray-400 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Back to sign in
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {step === "credentials"
            ? "Encrypted with AES-256-GCM. Passwords hashed with bcrypt."
            : "Two-factor authentication protects your account."}
        </p>
      </div>
    </div>
  );
}
