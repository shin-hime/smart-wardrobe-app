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
    return () => { cancelled = true; };
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
    return () => { cancelled = true; };
  }, [allowed, weather]);

  const outfitRows = useMemo(() => buildOutfitSlots(items), [items]);

  useEffect(() => {
    setSuggestedRows([]);
  }, [weather, items.length]);

  if (!allowed) return <div className="container py-5 text-secondary small">Loading…</div>;

  return (
    <div className="container py-5">
      <div className="sw-panel p-4 mb-4 text-center">
        <h1 className="h3 fw-semibold mb-2">Outfit Comparison</h1>
        <div className="btn-group flex-wrap mb-3" role="group">
          {["Clear", "Rain", "Clouds"].map((w) => (
            <button
              key={w}
              type="button"
              className={`btn btn-sm ${weather === w ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => setWeather(w)}
            >
              {w === "Clear" ? "Sunny" : w}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <button
            type="button"
            className="btn btn-dark rounded-pill px-4"
            onClick={() => setSuggestedRows(buildSuggestedOutfitSlots(items))}
            disabled={loading || items.length === 0}
          >
            ✨ Shuffle Option B
          </button>
        </div>
      </div>

      <div className="container-fluid">
        {loading ? (
          <p className="text-secondary text-center">Loading Wardrobe...</p>
        ) : (
          <div className="row g-4 justify-content-center">
            
            {/* COLUMN 1: OPTION A (SCROLLABLE) */}
            <div className="col-6 col-md-5">
              <h2 className="h6 text-center text-uppercase text-secondary mb-3">Option A</h2>
              <div 
                className="bg-white rounded-4 shadow-sm p-3" 
                style={{ height: '70vh', overflowY: 'auto', border: '1px solid #eee' }}
              >
                {outfitRows.map((row, index) => (
                  <div key={`mine-${index}`} className="text-center mb-4">
                    <span className="badge text-bg-light border mb-2" style={{ fontSize: '10px' }}>{row.label}</span>
                    <Image
                      src={row.item.img}
                      alt=""
                      width={400}
                      height={500}
                      unoptimized
                      style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '400px' }}
                      className="img-fluid rounded"
                    />
                    <p className="small fw-medium mt-2">{row.item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: OPTION B (SCROLLABLE) */}
            <div className="col-6 col-md-5">
              <h2 className="h6 text-center text-uppercase text-secondary mb-3">Option B</h2>
              <div 
                className="bg-white rounded-4 shadow-sm p-3" 
                style={{ height: '70vh', overflowY: 'auto', border: '1px solid #eee' }}
              >
                {suggestedRows.length > 0 ? (
                  suggestedRows.map((row, index) => (
                    <div key={`suggest-${index}`} className="text-center mb-4">
                      <span className="badge text-bg-light border mb-2" style={{ fontSize: '10px' }}>{row.label}</span>
                      <Image
                        src={row.item.img}
                        alt=""
                        width={400}
                        height={500}
                        unoptimized
                        style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '400px' }}
                        className="img-fluid rounded"
                      />
                      <p className="small fw-medium mt-2">{row.item.name}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                    <p className="small text-center">Click Shuffle to generate<br/>a second choice</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}