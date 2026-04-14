"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function WardrobePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [weather, setWeather] = useState("Clear");
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [itemWeather, setItemWeather] = useState("Clear");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // If not logged in, send to login page (no middleware file).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (cancelled) return;
      if (!data.user) {
        router.replace("/login?next=/wardrobe");
        return;
      }
      setAllowed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Load clothes when the user is allowed and the weather filter changes.
  useEffect(() => {
    if (!allowed) return;

    let cancelled = false;

    async function loadClothes() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/clothes?weather=${encodeURIComponent(weather)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!cancelled) {
          setClothes(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setClothes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadClothes();
    return () => {
      cancelled = true;
    };
  }, [allowed, weather]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onAddItem(e) {
    e.preventDefault();
    setFormError("");
    if (!file) {
      setFormError("Choose a photo for this item.");
      return;
    }
    setSaving(true);
    try {
      const img = await readFileAsDataUrl(file);
      const res = await fetch("/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          weather: itemWeather,
          img,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Could not save item.");
        return;
      }
      setName("");
      setDescription("");
      setItemWeather("Clear");
      setFile(null);
      // Reload list for the current weather filter
      const listRes = await fetch(
        `/api/clothes?weather=${encodeURIComponent(weather)}`,
        { credentials: "include" }
      );
      const listData = await listRes.json();
      setClothes(Array.isArray(listData) ? listData : []);
    } catch {
      setFormError("Could not read the image. Try another file.");
    } finally {
      setSaving(false);
    }
  }

  if (!allowed) {
    return (
      <div className="container py-5 text-secondary small">Loading…</div>
    );
  }

  return (
    <div className="container py-5">
      <div className="sw-panel p-4 mb-4 text-center">
        <h1 className="h3 fw-semibold mb-2">My wardrobe</h1>
        <p className="text-secondary small mb-3">
          Filter by weather: <strong className="text-dark">{weather}</strong>
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
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="sw-panel p-4">
            <h2 className="h6 fw-semibold mb-3">Add a clothing item</h2>
            {formError ? (
              <div className="alert alert-danger py-2 small" role="alert">
                {formError}
              </div>
            ) : null}
            <form onSubmit={onAddItem}>
              <div className="mb-3">
                <label className="form-label small" htmlFor="photo">
                  Photo
                </label>
                <input
                  id="photo"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {preview ? (
                  <Image
                    src={preview}
                    alt=""
                    width={800}
                    height={360}
                    unoptimized
                    className="img-fluid rounded border mt-2"
                    style={{
                      maxHeight: 180,
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label small" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fabric, fit, occasion…"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small" htmlFor="itemWeather">
                  Weather this suits
                </label>
                <select
                  id="itemWeather"
                  className="form-select"
                  value={itemWeather}
                  onChange={(e) => setItemWeather(e.target.value)}
                >
                  <option value="Clear">Clear / sunny</option>
                  <option value="Rain">Rain</option>
                  <option value="Clouds">Clouds</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-dark w-100"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save to wardrobe"}
              </button>
            </form>
          </div>
        </div>
        <div className="col-lg-7">
          {loading ? (
            <p className="text-secondary small">Loading your items…</p>
          ) : clothes.length > 0 ? (
            <div className="row g-3">
              {clothes.map((item) => (
                <div key={item.id} className="col-md-6">
                  <div className="card border h-100">
                    <Image
                      src={item.img}
                      className="card-img-top"
                      alt={item.name}
                      width={400}
                      height={200}
                      unoptimized
                      style={{ height: 200, objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h3 className="h6 card-title fw-semibold">{item.name}</h3>
                      {item.description ? (
                        <p className="card-text small text-secondary mb-2">
                          {item.description}
                        </p>
                      ) : null}
                      <span className="badge text-bg-light border">
                        {item.weather}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-secondary small py-5 px-3 border rounded bg-white">
              No items for this weather yet. Add one on the left, or switch
              the filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
