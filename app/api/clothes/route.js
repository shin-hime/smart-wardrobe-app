import { NextResponse } from "next/server";

export async function GET() {
  // This is your mock database of clothes
  const wardrobe = [
    { id: 1, name: "Cool Cotton T-Shirt", weather: "Clear", color: "Blue", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200" },
    { id: 2, name: "Waterproof Windbreaker", weather: "Rain", color: "Yellow", img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200" },
    { id: 3, name: "Light Hoodie", weather: "Clouds", color: "Grey", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200" },
    { id: 4, name: "Linen Shirt", weather: "Clear", color: "White", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200" }
  ];

  return NextResponse.json(wardrobe);
}