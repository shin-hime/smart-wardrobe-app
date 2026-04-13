import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('weather'); // Get the weather from the URL

  const wardrobe = [
    { id: 1, name: "Cool Cotton T-Shirt", weather: "Clear", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200" },
    { id: 2, name: "Waterproof Windbreaker", weather: "Rain", img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200" },
    { id: 3, name: "Light Hoodie", weather: "Clouds", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200" },
    { id: 4, name: "Linen Shirt", weather: "Clear", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200" }
  ];

  // If there's a filter, only return matching clothes
  const filteredWardrobe = filter 
    ? wardrobe.filter(item => item.weather === filter) 
    : wardrobe;

  return NextResponse.json(filteredWardrobe);
}