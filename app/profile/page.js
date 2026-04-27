"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ name: "", bio: "", avatar: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(""); 
  
  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
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
          avatar: data.user.avatar || "",
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

  useEffect(() => {
     if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
     } else if (form.avatar) { 
       setPreview(form.avatar);
     } else {
        setPreview("");
     }
  }, [file, form.avatar]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved("");
    setSaving(true);
    try {
      let avatar = "";
        if (file) {
           avatar = await readFileAsDataUrl(file);
        }

      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          avatar,
        }),
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
          avatar: data.user.avatar || "",
        });
          setPreview(data.user.avatar);
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
         {/* --- FACEBOOK STYLE HEADER SECTION --- */}
         <div className="text-center mb-4">
         <div className="position-relative d-inline-block mb-2">
           {preview ? (
             <img
              src={preview}
              alt="Profile preview"
              className="rounded-circle border shadow-sm"
             style={{ width: 140, height: 140, objectFit: "cover" }}
            />
           ) : (
             <div 
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center"
                style={{ width: 140, height: 140 }}
             >
                <span className="text-muted">No Image</span>
             </div>
        )}
        </div>
        {/* This h2 updates in real-time as you type in the Name input below */}
        <h2 className="h4 fw-bold mb-0">{form.name || "Your Name"}</h2>
        <p className="text-secondary small">{email}</p>
       </div>
       {/* --- END HEADER SECTION --- */}

        <hr className="my-4 opacity-10" />

       {/* 1. File Input (The control) */}
       <div className="mb-4">
          <label className="form-label small fw-semibold">Change Photo</label>
          <input
              type="file"
              className="form-control form-control-sm"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
       </div>

       {/* 2. Name Input */}
       <div className="mb-3">
          <label htmlFor="name" className="form-label small fw-semibold">Name</label>
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

       {/* 3. Bio Input */}
       <div className="mb-4">
          <label htmlFor="bio" className="form-label small fw-semibold">About you (optional)</label>
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
