import { NextResponse } from "next/server";
import { getSessionUserIdFromCookies } from "@/lib/session";
import { deleteClothingItem, updateClothingItem } from "@/lib/store";

const WEATHER_OPTIONS = new Set(["Clear", "Rain", "Clouds", "All"]);
const CATEGORY_OPTIONS = new Set([
  "hat",
  "top",
  "bottom",
  "dress",
  "shoes",
  "bag",
]);

function getItemId(params) {
  const itemId = typeof params?.id === "string" ? params.id.trim() : "";
  return itemId;
}

export async function PUT(request, { params }) {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const itemId = getItemId(params);
  if (!itemId) {
    return NextResponse.json({ error: "Item id is required." }, { status: 400 });
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
      { error: "Weather must be Clear, Rain, Clouds, or All." },
      { status: 400 }
    );
  }
  if (!CATEGORY_OPTIONS.has(category)) {
    return NextResponse.json(
      {
        error: "Category must be hat, top, bottom, dress, shoes, or bag.",
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

  const updated = await updateClothingItem(userId, itemId, {
    name,
    description,
    weather,
    category,
    img,
  });
  if (updated && typeof updated.saveError === "string") {
    return NextResponse.json({ error: updated.saveError }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request, { params }) {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const itemId = getItemId(params);
  if (!itemId) {
    return NextResponse.json({ error: "Item id is required." }, { status: 400 });
  }

  const deleted = await deleteClothingItem(userId, itemId);
  if (!deleted.ok) {
    return NextResponse.json({ error: deleted.saveError }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
