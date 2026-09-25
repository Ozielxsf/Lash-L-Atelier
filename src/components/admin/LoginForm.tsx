"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          router.replace("/admin");
          router.refresh();
          return;
        }
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Sign-in failed.");
        setBusy(false);
      }}
      className="mt-8 w-full space-y-4"
    >
      <div>
        <label htmlFor="password" className="block font-caps text-[0.68rem] font-semibold tracking-[0.26em] text-rouge uppercase">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-ink/20 bg-white px-4 text-base outline-none focus:border-rouge"
        />
      </div>
      {error && <p role="alert" className="text-sm text-rouge">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full rounded-full bg-rouge text-[0.8rem] font-medium tracking-[0.2em] text-white uppercase disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
