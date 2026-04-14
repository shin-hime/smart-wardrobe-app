import { cookies } from "next/headers";

// Class demo only: the cookie stores the logged-in user's id.
// A real app would use a database session or a signed token.

export function createSessionToken(userId) {
  return userId;
}

export function verifySessionToken(cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const id = cookieValue.trim();
  return id.length ? id : null;
}

export async function getSessionUserIdFromCookies() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get("sw_session")?.value);
}
