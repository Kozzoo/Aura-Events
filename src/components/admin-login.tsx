"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Login failed.");
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <form className="glass-panel w-full max-w-md" onSubmit={onSubmit}>
        <Link className="mb-8 inline-flex items-center gap-3" href="/">
          <span className="grid h-11 w-11 place-items-center rounded border border-yellow-300/50 bg-yellow-300 text-lg font-black text-black">
            A
          </span>
          <span className="text-sm font-semibold tracking-[0.38em]">AURA EVENTS</span>
        </Link>
        <p className="eyebrow">Secure admin</p>
        <h1 className="form-title">Dashboard login</h1>
            <label className="mt-4 block text-sm text-zinc-300">
              Username
              <input
                className="mt-2 w-full rounded border border-yellow-300/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-yellow-300"
                name="username"
                placeholder=""
                required
                type="text"
              />
            </label>
            <label className="mt-4 block text-sm text-zinc-300">
              Password
              <div className="relative mt-2">
                <input
                  className="w-full rounded border border-yellow-300/10 bg-white/[0.06] px-4 py-3 pr-10 text-white outline-none focus:border-yellow-300"
                  name="password"
                  placeholder=""
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.175-5.625M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.88 9.88a3 3 0 104.24 4.24" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? "Checking..." : "Login"}
        </button>
      </form>
    </main>
  );
}
