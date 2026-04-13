"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [clothes, setClothes] = useState([]);
  const [weather, setWeather] = useState("Clear");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClothes() {
      setLoading(true);
      const res = await fetch(`/api/clothes?weather=${weather}`);
      const data = await res.json();
      setClothes(data);
      setLoading(false);
    }
    loadClothes();
  }, [weather]);

  return (
    <div className={`container ${styles.page}`}>
      <header className={`text-center ${styles.hero}`}>
        <h1 className={styles.title}>Smart Wardrobe</h1>
        <p className={styles.subtitle}>
          Outfit ideas for Pathum Thani — weather:{" "}
          <strong className="text-dark">{weather}</strong>
        </p>
        <div className={styles.weatherRow}>
          <span className={styles.weatherLabel}>Pick weather:</span>
          <div className="btn-group shadow-sm" role="group" aria-label="Weather">
            <button
              type="button"
              className={`btn ${weather === "Clear" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setWeather("Clear")}
            >
              Sunny
            </button>
            <button
              type="button"
              className={`btn ${weather === "Rain" ? "btn-info text-white" : "btn-outline-info"}`}
              onClick={() => setWeather("Rain")}
            >
              Rainy
            </button>
            <button
              type="button"
              className={`btn ${weather === "Clouds" ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => setWeather("Clouds")}
            >
              Cloudy
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <p className={styles.loading}>Loading clothes…</p>
      ) : (
        <div className="row g-4">
          {clothes.length > 0 ? (
            clothes.map((item) => (
              <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                <div
                  className={`card h-100 border-0 shadow-sm ${styles.cardWrap}`}
                >
                  <img
                    src={item.img}
                    className="card-img-top"
                    alt={item.name}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h2 className="h6 card-title fw-bold mb-2">{item.name}</h2>
                    <span className="badge rounded-pill bg-light text-dark border">
                      {item.weather}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className={styles.empty}>
                No items for this weather. Try another button above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
