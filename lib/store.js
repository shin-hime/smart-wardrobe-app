import { createHash } from "crypto";
import { mysqlPool } from "@/utils/db";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

const WEATHER_OPTIONS = new Set(["Clear", "Rain", "Clouds"]);

function mapClothingRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    weather: row.weather,
    category: row.category ?? "top",
    img: row.img,
  };
}

/**
 * @returns {Promise<{ ok: true, user: { id: string, email: string } } | { ok: false, error: string, conflict?: boolean }>}
 */
export async function createUser(email, password) {
  const normalized = email.trim().toLowerCase();
  const id = randomId("u");
  const passwordHash = hashPassword(password);
  try {
    await mysqlPool.execute(
      "INSERT INTO sw_users (id, email, password_hash) VALUES (?, ?, ?)",
      [id, normalized, passwordHash]
    );
    return { ok: true, user: { id, email: normalized } };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return {
        ok: false,
        error: "An account with this email already exists.",
        conflict: true,
      };
    }
    console.error(err);
    return { ok: false, error: "Could not create account." };
  }
}

/**
 * @returns {Promise<{ ok: true, user: { id: string, email: string } } | { ok: false, error: string }>}
 */
export async function verifyUser(email, password) {
  const normalized = email.trim().toLowerCase();
  const [rows] = await mysqlPool.execute(
    "SELECT id, email, password_hash FROM sw_users WHERE email = ?",
    [normalized]
  );
  const user = rows[0];
  if (!user) return { ok: false, error: "Invalid email or password." };
  if (user.password_hash !== hashPassword(password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true, user: { id: user.id, email: user.email } };
}

/**
 * @returns {Promise<{ id: string, email: string } | null>}
 */
export async function getUserById(id) {
  const [rows] = await mysqlPool.execute(
    "SELECT id, email FROM sw_users WHERE id = ?",
    [id]
  );
  const u = rows[0];
  if (!u) return null;
  return { id: u.id, email: u.email };
}

/**
 * @param {string} userId
 * @param {string | null} [weatherFilter] Clear | Rain | Clouds
 * @returns {Promise<Array<{ id: string, name: string, description: string, weather: string, img: string }>>}
 */
export async function getWardrobe(userId, weatherFilter = null) {
  if (weatherFilter && WEATHER_OPTIONS.has(weatherFilter)) {
    const [rows] = await mysqlPool.execute(
      `SELECT id, name, description, weather, category, img FROM sw_clothes
       WHERE user_id = ? AND weather = ? ORDER BY created_at DESC`,
      [userId, weatherFilter]
    );
    return rows.map(mapClothingRow);
  }
  const [rows] = await mysqlPool.execute(
    `SELECT id, name, description, weather, category, img FROM sw_clothes
     WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(mapClothingRow);
}

/**
 * @returns {Promise<{ id: string, name: string, description: string, weather: string, category: string, img: string } | { saveError: string }>}
 */
export async function addClothingItem(userId, item) {
  const user = await getUserById(userId);
  if (!user) return { saveError: "Session user not found." };
  const id = randomId("c");
  try {
    await mysqlPool.execute(
      `INSERT INTO sw_clothes (id, user_id, name, description, weather, category, img)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        item.name,
        item.description,
        item.weather,
        item.category,
        item.img,
      ]
    );
    return { id, ...item };
  } catch (err) {
    console.error(err);
    let msg = err.sqlMessage || err.message || "Could not save item.";
    if (
      err.code === "ER_BAD_FIELD_ERROR" ||
      /unknown column ['`]?category/i.test(msg)
    ) {
      msg =
        "Database is missing the category column. In phpMyAdmin, run the SQL file db/migration_add_category.sql.";
    }
    if (
      err.code === "ER_NET_PACKET_TOO_LARGE" ||
      /max_allowed_packet|packet too large/i.test(msg)
    ) {
      msg =
        "Photo is too large for MySQL. Use a smaller image or raise max_allowed_packet in MySQL.";
    }
    return { saveError: msg };
  }
}
