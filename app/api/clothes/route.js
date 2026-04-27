import { NextResponse } from "next/server";
import { getSessionUserIdFromCookies } from "@/lib/session";
import { addClothingItem, getWardrobe } from "@/lib/store";

const WEATHER_OPTIONS = new Set(["Sunny", "Rainy", "Cloudy", "All"]);
const CATEGORY_OPTIONS = new Set([
  "hat",
  "top",
  "bottom",
  "dress",
  "shoes",
  "bag",
  "accessory",
]);

export async function GET(request) {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("weather");
  const weatherArg =
    filter && WEATHER_OPTIONS.has(filter) ? filter : null;
  let items;
  try {
    items = await getWardrobe(userId, weatherArg);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
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
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const img = typeof body.img === "string" ? body.img : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!WEATHER_OPTIONS.has(weather)) {
    return NextResponse.json(
      { error: "Weather must be Sunny, Rainy, Cloudy, or All." },
      { status: 400 }
    );
  }
  if (!CATEGORY_OPTIONS.has(category)) {
    return NextResponse.json(
      {
        error:
          "Category must be hat, accessory, top, bottom, dress, shoes, or bag.",
      },
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

  let created;
  try {
    created = await addClothingItem(userId, {
      name,
      description,
      weather,
      category,
      img,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
  if (created && typeof created.saveError === "string") {
    return NextResponse.json({ error: created.saveError }, { status: 500 });
  }
  if (!created || !created.id) {
    return NextResponse.json({ error: "Could not save item." }, { status: 500 });
  }
  return NextResponse.json(created, { status: 201 });
}
