import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUser } from "@/lib/store";
import { createSessionToken } from "@/lib/session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }
  let result;
  try {
    result = await verifyUser(email, password);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable." },
      { status: 503 }
    );
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  const token = createSessionToken(result.user.id);
  const cookieStore = await cookies();
  cookieStore.set("sw_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ user: result.user });
}
