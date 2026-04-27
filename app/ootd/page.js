"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildSuggestedOutfitSlots } from "@/lib/outfit";

export default function OotdPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [weather, setWeather] = useState("Sunny"); // Standardized to match Wardrobe
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Separate states for both columns
  const [rowsA, setRowsA] = useState([]);
  const [rowsB, setRowsB] = useState([]);

  // Auth check
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (!data.user) {
        router.replace("/login?next=/ootd");
        return;
      }
      setAllowed(true);
    })();
  }, [router]);

  // Load items and initialize random outfits
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
        if (!cancelled) {
          const dataArray = Array.isArray(data) ? data : [];
          setItems(dataArray);
          
          // INITIAL RANDOMIZATION: Make them different on load
          setRowsA(buildSuggestedOutfitSlots(dataArray));
          setRowsB(buildSuggestedOutfitSlots(dataArray));
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [allowed, weather]);

  // Shuffle Logic Functions
  const handleShuffleA = () => {
    setRowsA(buildSuggestedOutfitSlots(items));
  };

  const handleShuffleB = () => {
    setRowsB(buildSuggestedOutfitSlots(items));
  };

  if (!allowed) return <div className="p-5 text-center text-muted">Loading…</div>;

  return (
    <div className="container py-5">
      <div className="sw-panel p-4 mb-4 text-center bg-white border rounded shadow-sm">
        <h1 className="h4 fw-bold mb-3">Outfit Studio</h1>
        
        {/* Standardized Weather Buttons */}
        <div className="btn-group mb-4 shadow-sm border rounded-pill overflow-hidden">
          {["Sunny", "Rainy", "Cloudy"].map((w) => (
            <button
              key={w}
              type="button"
              className={`btn btn-sm px-4 ${weather === w ? "btn-dark" : "btn-light text-muted"}`}
              onClick={() => setWeather(w)}
            >
              {w}
            </button>
          ))}
        </div>

        {/* TWO SHUFFLE BUTTONS */}
        <div className="d-flex justify-content-center gap-3">
          <button className="btn btn-outline-dark rounded-pill px-4 fw-bold"
            onClick={handleShuffleA}          
            >
            🔀 Shuffle Option A
          </button>
          <button
            className="btn btn-dark rounded-pill px-4 fw-bold"
            onClick={handleShuffleB}
          >
            ✨ Shuffle Option B
          </button>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        {/* OPTION A */}
        <div className="col-5 col-md-4">
          <p className="text-center small text-uppercase fw-bold text-secondary mb-2">Option A</p>
        <div className="outfit-board p-2 bg-white rounded-4 shadow-sm border" style={{ height: '65vh', overflowY: 'auto' }}>        
              {rowsA.length > 0 ? rowsA.map((row, index) => (
              <div key={`a-${index}`} className="position-relative mb-2 outfit-item">
                <span className="badge position-absolute top-0 start-0 m-2 px-2 py-1 rounded" style={{fontSize: '10px',background: 'rgba(0, 0, 0, 0.65)',color: '#fff', backdropFilter: "blur(4px)"}}>{row.label}</span>
                <Image
                  src={row.item.img}
                  alt=""
                  width={500}
                  height={600}
                  unoptimized
                  className="img-fluid rounded-3 shadow-sm border bg-white"
                  style={{ width: '100%', height: 'auto',display: 'block', objectFit: 'cover' }}
                />
              </div>
            )) : 
            <p className="text-center text-muted mt-5 small">No {weather} items</p>}
          </div>
        </div>

        {/* OPTION B */}
        <div className="col-5 col-md-4">
          <p className="text-center small text-uppercase fw-bold text-secondary mb-2">Option B</p>
          <div className="outfit-board p-2 bg-white rounded-4 shadow-sm border" style={{ height: '65vh', overflowY: 'auto' }}>
            {rowsB.length > 0 ? rowsB.map((row, index) => (
              <div key={`b-${index}`} className="position-relative mb-2 outfit-item">
                <span className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded" style={{fontSize: '10px',background: 'rgba(0, 0, 0, 0.65)',color: '#fff', backdropFilter: "blur(4px)"}}>{row.label}</span>
                <Image
                  src={row.item.img}
                  alt=""
                  width={500}
                  height={600}
                  unoptimized
                  className="img-fluid rounded-3 shadow-sm border bg-white"
                  style={{ width: '100%', height: 'auto',display: 'block', objectFit: 'cover' }}
                />
              </div>
            )) : 
            <p className="text-center text-muted mt-5 small">No {weather} items</p>}
          </div>
        </div>
      </div>
    </div>
  );
}