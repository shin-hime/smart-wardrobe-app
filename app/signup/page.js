"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError(
          `Server error (${res.status}). Check that MySQL is running and db/schema + migrations are applied.`
        );
        return;
      }
      if (!res.ok) {
        setError(
          data.error ||
            data.message ||
            `Sign up failed (HTTP ${res.status}).`
        );
        return;
      }
      router.push("/wardrobe");
      router.refresh();
    } catch (err) {
      setError(err.message || "Network error. Try again.");
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
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {error}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="sw-panel p-4 p-md-5">
        <div className="mb-3">
          <label htmlFor="name" className="form-label small">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control rounded-3"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label small">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control rounded-3"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label small">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control rounded-3"
            autoComplete="new-password"
            value={form.password}
            onChange={onChange}
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
