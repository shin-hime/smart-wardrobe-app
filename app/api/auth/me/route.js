import { NextResponse } from "next/server";
import { getSessionUserIdFromCookies } from "@/lib/session";
import { getUserById } from "@/lib/store";

export async function GET() {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
