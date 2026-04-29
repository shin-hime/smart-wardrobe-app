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

   // Add this useEffect below your existing one in the Navbar component
  useEffect(() => {
    const handleProfileUpdate = () => {
      refresh(); // This calls your existing fetch function
    };

    // Listen for a custom "profileUpdated" event
     window.addEventListener("profileUpdated", handleProfileUpdate);

     return () => {
       window.removeEventListener("profileUpdated", handleProfileUpdate);
     };
  }, [refresh]);

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
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle py-md-2 mb-0 text-truncate d-inline-flex fw-semibold align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title={user.email ? `Signed in as ${user.email}` : ""}
                >
                  {/* 1. Display the Profile Picture (Avatar) */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="rounded-circle border me-2"
                      style={{ width: "45px", height: "45px", objectFit: "cover" }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary d-inline-block me-2" 
                      style={{ width: "45px", height: "45px" }} 
                    />
                  )}
                  
                  <span className="text-truncate" style={{ maxWidth: "10rem" }}>
                    {user.name || user.email}
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3">
                  <li>
                    <Link className="dropdown-item py-2 fw-medium" href="/profile">
                      Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item py-2 text-danger fw-medium"
                      onClick={logout}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              </li>
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
