"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const isAuthed = Boolean(user);

  return (
    <nav className="navbar navbar-expand-md navbar-light sw-navbar sticky-top py-2">
      <div className="container">
        <Link className="navbar-brand" href="/">
          Smart Wardrobe
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-md-0 gap-md-1">
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/" ? "active" : ""}`}
                href="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/about" ? "active" : ""}`}
                href="/about"
              >
                About
              </Link>
            </li>
            {isAuthed ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      pathname.startsWith("/wardrobe") ? "active" : ""
                    }`}
                    href="/wardrobe"
                  >
                    Wardrobe
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      pathname.startsWith("/ootd") ? "active" : ""
                    }`}
                    href="/ootd"
                  >
                    OOTD
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
          <ul className="navbar-nav ms-md-auto align-items-md-center gap-2">
            {loading ? (
              <li className="nav-item">
                <span className="nav-link disabled small">…</span>
              </li>
            ) : isAuthed ? (
              <>
                <li className="nav-item">
                  <span
                    className="nav-link text-email py-md-2 mb-0 text-truncate d-inline-block"
                    style={{ maxWidth: "14rem" }}
                    title={user.email}
                  >
                    {user.email}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      pathname === "/login" ? "active" : ""
                    }`}
                    href="/login"
                  >
                    Log in
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-sm btn-dark rounded-pill px-3"
                    href="/signup"
                  >
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
