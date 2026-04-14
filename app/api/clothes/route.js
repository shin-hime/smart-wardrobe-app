import { NextResponse } from "next/server";
import { getSessionUserIdFromCookies } from "@/lib/session";
import { addClothingItem, getWardrobe } from "@/lib/store";

const WEATHER_OPTIONS = new Set(["Clear", "Rain", "Clouds"]);

export async function GET(request) {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("weather");
  let items = getWardrobe(userId);
  if (filter && WEATHER_OPTIONS.has(filter)) {
    items = items.filter((item) => item.weather === filter);
  }
  return NextResponse.json(items);
}

export async function POST(request) {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const weather = typeof body.weather === "string" ? body.weather : "";
  const img = typeof body.img === "string" ? body.img : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!WEATHER_OPTIONS.has(weather)) {
    return NextResponse.json(
      { error: "Weather must be Clear, Rain, or Clouds." },
      { status: 400 }
    );
  }
  if (!img || !img.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "A valid image (data URL) is required." },
      { status: 400 }
    );
  }
  if (img.length > 2_500_000) {
    return NextResponse.json(
      { error: "Image is too large. Try a smaller photo." },
      { status: 400 }
    );
  }

  const created = addClothingItem(userId, {
    name,
    description,
    weather,
    img,
  });
  if (!created) {
    return NextResponse.json({ error: "Could not save item." }, { status: 500 });
  }
  return NextResponse.json(created, { status: 201 });
}
