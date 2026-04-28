"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("File could not be converted to an image string."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function WardrobePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [weather, setWeather] = useState("Sunny");
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [editingData, setEditingData] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingPreview, setEditingPreview] = useState("");
  const [editingSaving, setEditingSaving] = useState(false);
  const [editingError, setEditingError] = useState("");
  const [editingSuccess, setEditingSuccess] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    itemWeather: "Sunny",
    itemCategory: "top",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("name"); // Default search by name
  const [activeSearch, setActiveSearch] = useState(""); // Only updates on button click
  
  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onEditFormChange(e) {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  }

  async function reloadClothes(selectedWeather) {
    const listRes = await fetch(
      `/api/clothes?weather=${encodeURIComponent(selectedWeather)}`,
      { credentials: "include" }
    );
    const listData = await listRes.json();
    return Array.isArray(listData) ? listData : [];
  }

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
        const items = await reloadClothes(weather);
        if (!cancelled) setClothes(items);
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

  useEffect(() => {
    if (!formSuccess) return;
    const t = setTimeout(() => setFormSuccess(""), 4500);
    return () => clearTimeout(t);
  }, [formSuccess]);

  useEffect(() => {
    if (!editingFile) {
      setEditingPreview("");
      return;
    }
    const url = URL.createObjectURL(editingFile);
    setEditingPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editingFile]);

  useEffect(() => {
    if (!editingSuccess) return;
    const t = setTimeout(() => setEditingSuccess(""), 4500);
    return () => clearTimeout(t);
  }, [editingSuccess]);

  async function onAddItem(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!file) {
      setFormError("Choose a photo for this item.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    // Keep client-side limit close to API limit (2_500_000 chars data URL).
    if (file.size > 1_800_000) {
      setFormError("Image is too large. Try a smaller photo.");
      return;
    }
    setSaving(true);
    let img = "";
    try {
      img = await readFileAsDataUrl(file);
    } catch {
      setFormError("Could not read this image file. Try another one.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          weather: form.itemWeather,
          category: form.itemCategory,
          img,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Could not save item.");
        return;
      }
      setForm({
        name: "",
        description: "",
        itemWeather: "Sunny",
        itemCategory: "top",
      });
      setFile(null);
      setFileInputKey((k) => k + 1);
      setFormSuccess("Item saved to your wardrobe.");
      const items = await reloadClothes(weather);
      setClothes(items);
    } catch {
      setFormError("Could not reach server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingFile(null);
    setEditingPreview("");
    setEditingError("");
    setEditingSuccess("");
    setEditingData({
      name: item.name || "",
      description: item.description || "",
      weather: item.weather || "Sunny",
      category: item.category || "top",
      img: item.img || "",
    });
  }

  function cancelEdit() {
    setEditingId("");
    setEditingData(null);
    setEditingFile(null);
    setEditingPreview("");
    setEditingError("");
  }

  async function onSaveEdit(itemId) {
    if (!editingData) return;
    setEditingError("");
    setEditingSuccess("");
    setEditingSaving(true);
    try {
      const img = editingFile
        ? await readFileAsDataUrl(editingFile)
        : editingData.img;
      const res = await fetch(`/api/clothes/${encodeURIComponent(itemId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editingData.name,
          description: editingData.description,
          weather: editingData.weather,
          category: editingData.category,
          img,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditingError(data.error || "Could not update item.");
        return;
      }
      setEditingSuccess("Item updated.");
      cancelEdit();
      const items = await reloadClothes(weather);
      setClothes(items);
    } catch {
      setEditingError("Could not update item. Try again.");
    } finally {
      setEditingSaving(false);
    }
  }

  async function onDeleteItem(itemId) {
    const confirmed = window.confirm("Remove this item from your wardrobe?");
    if (!confirmed) return;
    setDeletingId(itemId);
    setEditingError("");
    setEditingSuccess("");
    try {
      const res = await fetch(`/api/clothes/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditingError(data.error || "Could not delete item.");
        return;
      }
      if (editingId === itemId) cancelEdit();
      setEditingSuccess("Item removed.");
      const items = await reloadClothes(weather);
      setClothes(items);
    } finally {
      setDeletingId("");
    }
  }

  if (!allowed) {
    return (
      <div className="container py-5 text-secondary small">Loading…</div>
    );
  }
  // filter clothes based on weather and search term 
  const filteredClothes = clothes.filter((item) => {
    // Always respect weather (including "All")
  const matchesWeather =
    item.weather === weather || item.weather === "All";
    // If user hasn't clicked search, just show by weather
    if (!activeSearch || activeSearch.trim() === "") {
      return matchesWeather;
    }

    // If user clicked search, find the item
    const searchLower = activeSearch.toLowerCase();

    let matchesSearch = false;
    if (searchCategory === "name") {
       matchesSearch = item.name?.toLowerCase().includes(searchLower);
    } else if (searchCategory === "category") {
      // Check both 'category' and 'itemCategory' to be safe
      const typeValue = item.category || item.itemCategory || "";
      matchesSearch = typeValue.toLowerCase().includes(searchLower);
    }
    return matchesWeather && matchesSearch;
  });

  return (
    <div className="container py-5">
      <div className="sw-panel p-4 mb-4">
        <div className="row align-items-center">
          {/* Left Column: Title */}
          <div className="col-md-3 text-start">
             <h1 className="h4 fw-semibold mb-0">My wardrobe</h1>
          </div>

          {/* Middle Column: Weather Buttons */}
          <div className="col-md-5 text-center">
            <div className="btn-group" role="group">
               {["Sunny", "Rainy", "Cloudy"].map((w) => (
                 <button
                   key={w}
                   type="button"
                   className={`btn btn-sm ${!activeSearch &&weather === w ? "btn-dark" : "btn-outline-secondary"}`}
                   onClick={() => {
                     setWeather(w);
                     setActiveSearch(""); // Clear search when changing weather
                     setSearchTerm("");   // Clearing search box
                   }}
                 >
                   {w}
                 </button>
                ))}
             </div>
          </div>

          {/* Right Column: Search Engine */}
          <div className="col-md-4">
             <div className="input-group input-group-sm">
              <select 
                 className="form-select" 
                 style={{ maxWidth: "90px", fontSize: "0.75rem" }}
                 value={searchCategory}
                 onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="category">Category</option>
              </select>
              <input
                 type="text"
                 className="form-control"
                 placeholder="Search..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && setActiveSearch(searchTerm)}
              />
              <button 
                 className="btn btn-dark" 
                 type="button"
                 onClick={() => {
                  if (searchTerm.trim() !== "") {
                       setActiveSearch(searchTerm)
                     }
                  }}
              >
                 🔍
            </button>
          </div>
        </div>
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
            {formSuccess ? (
              <div className="alert alert-success py-2 small" role="status">
                {formSuccess}
              </div>
            ) : null}
            <form onSubmit={onAddItem}>
              <div className="mb-3">
                <label className="form-label small" htmlFor="photo">
                  Photo
                </label>
                <input
                  key={fileInputKey}
                  id="photo"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    setFormSuccess("");
                    setFile(e.target.files?.[0] || null);
                  }}
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
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={onFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={onFormChange}
                  placeholder="Fabric, fit, occasion…"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small" htmlFor="itemWeather">
                  Weather this suits
                </label>
                <select
                  id="itemWeather"
                  name="itemWeather"
                  className="form-select"
                  value={form.itemWeather}
                  onChange={onFormChange}
                >
                  <option value="Sunny">Clear / Sunny</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="All">All weather</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small" htmlFor="itemCategory">
                  Type of item
                </label>
                <select
                  id="itemCategory"
                  name="itemCategory"
                  className="form-select"
                  value={form.itemCategory}
                  onChange={onFormChange}
                >
                  <option value="hat">Hat </option>
                  <option value="accessory">Accessory</option>  
                  <option value="top">Top</option>
                  <option value="bottom">Pants / skirt</option>
                  <option value="dress">Dress</option>
                  <option value="shoes">Shoes</option>
                  <option value="bag">Bag</option>
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
          {editingError ? (
            <div className="alert alert-danger py-2 small" role="alert">
              {editingError}
            </div>
          ) : null}
          {editingSuccess ? (
            <div className="alert alert-success py-2 small" role="status">
              {editingSuccess}
            </div>
          ) : null}
          {loading ? (
            <p className="text-secondary small">Loading your items…</p>
          ) : filteredClothes.length > 0 ? (
            <div className="wardrobe-grid">
              {filteredClothes.map((item) => (
                <div key={item.id} className="wardrobe-card">
                  <div className="card border h-100">
                    <Image
                      src={item.img}
                      className="card-img-top"
                      alt={item.name}
                      width={400}
                      height={600}
                      unoptimized
                      style={{ height: 300, objectFit: "cover" }}
                    />
                    <div className="card-body">
                      {editingId === item.id && editingData ? (
                        <>
                          <div className="mb-2">
                            <label className="form-label small mb-1">Name</label>
                            <input
                              name="name"
                              className="form-control form-control-sm"
                              value={editingData.name}
                              onChange={onEditFormChange}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              className="form-control form-control-sm"
                              rows={2}
                              value={editingData.description}
                              onChange={onEditFormChange}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small mb-1">
                              Weather
                            </label>
                            <select
                              name="weather"
                              className="form-select form-select-sm"
                              value={editingData.weather}
                              onChange={onEditFormChange}
                            >
                              <option value="Sunny">Clear / Sunny</option>
                              <option value="Rainy">Rainy</option>
                              <option value="Cloudy">Cloudy</option>
                              <option value="All">All weather</option>
                            </select>
                          </div>
                          <div className="mb-2">
                            <label className="form-label small mb-1">
                              Category
                            </label>
                            <select
                              name="category"
                              className="form-select form-select-sm"
                              value={editingData.category}
                              onChange={onEditFormChange}
                            >
                              <option value="hat">Hat</option>
                              <option value="accessory">Accessory</option>
                              <option value="top">Top</option>
                              <option value="bottom">Pants / skirt</option>
                              <option value="dress">Dress</option>
                              <option value="shoes">Shoes</option>
                              <option value="bag">Bag</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label small mb-1">
                              Replace photo (optional)
                            </label>
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              accept="image/*"
                              onChange={(e) =>
                                setEditingFile(e.target.files?.[0] || null)
                              }
                            />
                            {editingPreview ? (
                              <Image
                                src={editingPreview}
                                alt=""
                                width={800}
                                height={360}
                                unoptimized
                                className="img-fluid rounded border mt-2"
                                style={{
                                  maxHeight: 160,
                                  objectFit: "cover",
                                  width: "100%",
                                }}
                              />
                            ) : null}
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-dark"
                              disabled={editingSaving}
                              onClick={() => onSaveEdit(item.id)}
                            >
                              {editingSaving ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              disabled={editingSaving}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="h6 card-title fw-semibold">{item.name}</h3>
                          {item.description ? (
                            <p className="card-text small text-secondary mb-2">
                              {item.description}
                            </p>
                          ) : null}
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            <span className="badge text-bg-light border">
                              {item.weather}
                            </span>
                            <span className="badge text-bg-secondary">
                              {item.category || "top"}
                            </span>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => startEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={deletingId === item.id}
                              onClick={() => onDeleteItem(item.id)}
                            >
                              {deletingId === item.id ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </>
                      )}
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
