"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.push("/");
        } else if (!data.needsSetup) {
          router.push("/login");
        }
        setChecking(false);
      });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400">Checking setup status...</p>
      </div>
    );
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
          password,
          role: "owner",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.details
            ? data.details.map((d: { message: string }) => d.message).join(", ")
            : data.error || "Registration failed"
        );
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Warren</h1>
          <p className="text-gray-400 mt-2">First-Time Setup</p>
          <p className="text-gray-500 mt-1 text-sm">
            Create your owner account
          </p>
        </div>

        <form onSubmit={handleSetup} className="space-y-5">
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
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tom Kingsley"
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
              placeholder="Min 12 characters, mixed case + number"
              required
              minLength={12}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter password"
              required
              minLength={12}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !displayName || !password || !confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? "Creating account..." : "Create Owner Account"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="text-sm font-medium text-gray-300">Security</h3>
          <ul className="mt-2 text-xs text-gray-500 space-y-1">
            <li>Passwords hashed with bcrypt (12 rounds)</li>
            <li>Sensitive data encrypted with AES-256-GCM</li>
            <li>Sessions expire after 24 hours</li>
            <li>Login rate-limited to 5 attempts per 15 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
