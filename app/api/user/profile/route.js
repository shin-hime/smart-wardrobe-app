import { NextResponse } from "next/server";
import { getSessionUserIdFromCookies } from "@/lib/session";
import { updateUserProfile } from "@/lib/store";

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
  const name = typeof body.name === "string" ? body.name : "";
  const bio = typeof body.bio === "string" ? body.bio : "";
  let updated;
  try {
    updated = await updateUserProfile(userId, name, bio);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable." },
      { status: 503 }
    );
  }
  if (updated && typeof updated.saveError === "string") {
    return NextResponse.json({ error: updated.saveError }, { status: 400 });
  }
  if (!updated || !updated.id) {
    return NextResponse.json(
      { error: "Could not update profile." },
      { status: 500 }
    );
  }
  return NextResponse.json({ user: updated });
}
