import { createHash } from "crypto";

// In-memory data (clears when the server restarts). Fine for a class demo.

const usersByEmail = new Map();
const usersById = new Map();
const wardrobesByUserId = new Map();

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function randomId() {
  return `u_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function createUser(email, password) {
  const normalized = email.trim().toLowerCase();
  if (usersByEmail.has(normalized)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const id = randomId();
  const record = {
    id,
    email: normalized,
    passwordHash: hashPassword(password),
  };
  usersByEmail.set(normalized, record);
  usersById.set(id, record);
  wardrobesByUserId.set(id, []);
  return { ok: true, user: { id, email: normalized } };
}

export function verifyUser(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = usersByEmail.get(normalized);
  if (!user) return { ok: false, error: "Invalid email or password." };
  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true, user: { id: user.id, email: user.email } };
}

export function getUserById(id) {
  const u = usersById.get(id);
  if (!u) return null;
  return { id: u.id, email: u.email };
}

export function getWardrobe(userId) {
  return wardrobesByUserId.get(userId) || [];
}

export function addClothingItem(userId, item) {
  const list = wardrobesByUserId.get(userId);
  if (!list) return null;
  const id = `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const entry = { id, ...item };
  list.push(entry);
  return entry;
}
