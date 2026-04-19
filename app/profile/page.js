"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ name: "", bio: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (cancelled) return;
        if (!data.user) {
          router.replace("/login?next=/profile");
          return;
        }
        setEmail(data.user.email || "");
        setForm({
          name: data.user.name || "",
          bio: data.user.bio || "",
        });
        setAllowed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved("");
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      if (data.user) {
        setForm({
          name: data.user.name || "",
          bio: data.user.bio || "",
        });
      }
      setSaved("Profile saved.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(""), 4000);
    return () => clearTimeout(t);
  }, [saved]);

  if (!allowed && loading) {
    return (
      <div className="container py-5 text-secondary small">Loading…</div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="h4 mb-2 fw-semibold">Profile</h1>
      <p className="small text-secondary mb-4">
        <Link href="/wardrobe">Back to wardrobe</Link>
      </p>
      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="alert alert-success py-2 small" role="status">
          {saved}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="sw-panel p-4 p-md-5">
        <div className="mb-3">
          <label htmlFor="email-ro" className="form-label small">
            Email
          </label>
          <input
            id="email-ro"
            type="email"
            className="form-control rounded-3 bg-light"
            value={email}
            readOnly
          />
          <div className="form-text">Email cannot be changed here.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="name" className="form-label small">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control rounded-3"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bio" className="form-label small">
            About you (optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-control rounded-3"
            rows={4}
            value={form.bio}
            onChange={onChange}
            placeholder="Style notes, campus, favorite colors…"
          />
        </div>
        <button
          type="submit"
          className="btn btn-dark w-100 rounded-pill py-2"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
