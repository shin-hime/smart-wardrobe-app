"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not create account.");
        return;
      }
      router.push("/wardrobe");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <h1 className="h4 mb-2 fw-semibold" style={{ color: "var(--sw-text)" }}>
        Sign up
      </h1>
      <p className="small mb-4" style={{ color: "var(--sw-text-muted)" }}>
        Already registered? <Link href="/login">Log in</Link>.
      </p>
      {error ? (
        <div
          className="alert py-2 small mb-3"
          role="alert"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecdca",
            color: "#7f1d1d",
          }}
        >
          {error}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="sw-panel p-4 p-md-5">
        <div className="mb-3">
          <label htmlFor="email" className="form-label small">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-control rounded-3"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label small">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control rounded-3"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <div className="form-text">At least 6 characters.</div>
        </div>
        <button
          type="submit"
          className="btn btn-dark w-100 rounded-pill py-2"
          disabled={submitting}
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
