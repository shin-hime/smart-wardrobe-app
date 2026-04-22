"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildOutfitSlots, buildSuggestedOutfitSlots } from "@/lib/outfit";

export default function OotdPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [weather, setWeather] = useState("Clear");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRows, setSuggestedRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (cancelled) return;
      if (!data.user) {
        router.replace("/login?next=/ootd");
        return;
      }
      setAllowed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/clothes?weather=${encodeURIComponent(weather)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed, weather]);

  const outfitRows = useMemo(() => buildOutfitSlots(items), [items]);

  useEffect(() => {
    setSuggestedRows([]);
  }, [weather, items.length]);

  if (!allowed) {
    return (
      <div className="container py-5 text-secondary small">Loading…</div>
    );
  }

  return (
    <div className="container py-5">
      <div className="sw-panel p-4 mb-4 text-center">
        <h1 className="h3 fw-semibold mb-2">Outfit for the weather</h1>
        <p className="text-secondary small mb-2">
          One pick per slot from items you tagged for{" "}
          <strong className="text-dark">{weather}</strong>.
        </p>
        <p className="small mb-3">
          <Link href="/wardrobe">Add or edit items in Wardrobe</Link>
        </p>
        <div className="btn-group flex-wrap" role="group">
          <button
            type="button"
            className={`btn btn-sm ${
              weather === "Clear" ? "btn-dark" : "btn-outline-secondary"
            }`}
            onClick={() => setWeather("Clear")}
          >
            Sunny
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              weather === "Rain" ? "btn-dark" : "btn-outline-secondary"
            }`}
            onClick={() => setWeather("Rain")}
          >
            Rain
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              weather === "Clouds" ? "btn-dark" : "btn-outline-secondary"
            }`}
            onClick={() => setWeather("Clouds")}
          >
            Cloudy
          </button>
        </div>
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={() => setSuggestedRows(buildSuggestedOutfitSlots(items))}
            disabled={loading || items.length === 0}
          >
            Suggest outfit
          </button>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: 420 }}>
        {loading ? (
          <p className="text-secondary small text-center">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-secondary small text-center border rounded p-4 bg-white">
            No items for this weather. Tag some pieces in Wardrobe, then come
            back.
          </p>
        ) : outfitRows.length === 0 ? (
          <p className="text-secondary small text-center border rounded p-4 bg-white">
            Add items with types (top, bottom, shoes, …) for this weather to
            build an outfit.
          </p>
        ) : (
          <div className="d-flex flex-column gap-3">
            <p className="small text-uppercase text-secondary mb-1">
              Current outfit
            </p>
            {outfitRows.map((row) => (
              <div
                key={row.label}
                className="border rounded-3 p-3 bg-white text-center shadow-sm"
              >
                <p className="small text-secondary text-uppercase mb-2 mb-md-3">
                  {row.label}
                </p>
                <div
                  className="rounded-3 mx-auto d-flex align-items-center justify-content-center bg-light border"
                  style={{ minHeight: 200, maxWidth: 360 }}
                >
                  <Image
                    src={row.item.img}
                    alt={row.item.name}
                    width={360}
                    height={280}
                    unoptimized
                    className="img-fluid p-2"
                    style={{
                      maxHeight: 240,
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <p className="small fw-semibold mt-2 mb-0">{row.item.name}</p>
              </div>
            ))}
            {suggestedRows.length > 0 ? (
              <>
                <p className="small text-uppercase text-secondary mt-2 mb-1">
                  Suggested outfit
                </p>
                {suggestedRows.map((row) => (
                  <div
                    key={`suggest-${row.label}-${row.item.id}`}
                    className="border rounded-3 p-3 bg-white text-center shadow-sm"
                  >
                    <p className="small text-secondary text-uppercase mb-2 mb-md-3">
                      {row.label}
                    </p>
                    <div
                      className="rounded-3 mx-auto d-flex align-items-center justify-content-center bg-light border"
                      style={{ minHeight: 200, maxWidth: 360 }}
                    >
                      <Image
                        src={row.item.img}
                        alt={row.item.name}
                        width={360}
                        height={280}
                        unoptimized
                        className="img-fluid p-2"
                        style={{
                          maxHeight: 240,
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p className="small fw-semibold mt-2 mb-0">{row.item.name}</p>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
