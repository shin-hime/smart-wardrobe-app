"use client"; // Required for useState/useEffect
import { useState, useEffect } from "react";

export default function Home() {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    // Fetching from the API we just created
    fetch("/api/clothes")
      .then((res) => res.json())
      .then((data) => setClothes(data))
      .catch((err) => console.error("Error fetching clothes:", err));
  }, []);

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Smart Wardrobe</h1>
        <p className="lead">Today's OOTD Suggestions for Rangsit</p>
      </header>

      <div className="row g-4">
        {clothes.map((item) => (
          <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <img src={item.img} className="card-img-top" alt={item.name} style={{height: "200px", objectFit: "cover"}} />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <span className={`badge ${item.weather === 'Rain' ? 'bg-info' : 'bg-warning'}`}>
                  {item.weather}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}