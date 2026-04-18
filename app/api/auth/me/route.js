import { NextResponse } from "next/server";
import { getSessionUserIdFromCookies } from "@/lib/session";
import { getUserById } from "@/lib/store";

export async function GET() {
  const userId = await getSessionUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  let user;
  try {
    user = await getUserById(userId);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ user: null });
  }
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
