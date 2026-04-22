import { createHash } from "crypto";
import { mysqlPool } from "@/utils/db";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

// Class-style: mysqlPool.promise() then .query(...) — see class-reference/07_next_fullstack/app/api
async function query(sql, params) {
  const promisePool = mysqlPool.promise();
  const [rows] = await promisePool.query(sql, params);
  return rows;
}

const WEATHER_OPTIONS = new Set(["Clear", "Rain", "Clouds"]);

function rowToPublicUser(row) {
  if (!row) return null;
  const email = row.email;
  const trimmed = row.full_name != null ? String(row.full_name).trim() : "";
  const name =
    trimmed ||
    (email && email.includes("@") ? email.split("@")[0] : null) ||
    "User";
  return {
    id: row.id,
    email,
    name,
    bio: row.bio != null ? String(row.bio) : "",
  };
}

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
 * @returns {Promise<{ ok: true, user: { id: string, email: string, name: string, bio: string } } | { ok: false, error: string, conflict?: boolean }>}
 */
export async function createUser(email, password, fullName) {
  const normalized = email.trim().toLowerCase();
  const fn = typeof fullName === "string" ? fullName.trim() : "";
  if (!fn) {
    return { ok: false, error: "Name is required." };
  }
  const id = randomId("u");
  const passwordHash = hashPassword(password);
  try {
    await query(
      "INSERT INTO sw_users (id, email, full_name, bio, password_hash) VALUES (?, ?, ?, NULL, ?)",
      [id, normalized, fn, passwordHash]
    );
    return {
      ok: true,
      user: { id, email: normalized, name: fn, bio: "" },
    };
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
 * @returns {Promise<{ ok: true, user: { id: string, email: string, name: string, bio: string } } | { ok: false, error: string }>}
 */
export async function verifyUser(email, password) {
  const normalized = email.trim().toLowerCase();
  const rows = await query(
    "SELECT id, email, full_name, bio, password_hash FROM sw_users WHERE email = ?",
    [normalized]
  );
  const user = rows[0];
  if (!user) return { ok: false, error: "Invalid email or password." };
  if (user.password_hash !== hashPassword(password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  const pub = rowToPublicUser(user);
  return { ok: true, user: pub };
}

/**
 * @returns {Promise<{ id: string, email: string, name: string, bio: string } | null>}
 */
export async function getUserById(id) {
  const rows = await query(
    "SELECT id, email, full_name, bio FROM sw_users WHERE id = ?",
    [id]
  );
  const u = rows[0];
  if (!u) return null;
  return rowToPublicUser(u);
}

/**
 * @returns {Promise<{ id: string, email: string, name: string, bio: string } | { saveError: string } | null>}
 */
export async function updateUserProfile(userId, fullName, bio) {
  const fn = typeof fullName === "string" ? fullName.trim() : "";
  if (!fn) {
    return { saveError: "Name is required." };
  }
  const bioStr =
    typeof bio === "string" ? bio.trim() : bio == null ? "" : String(bio);
  try {
    await query("UPDATE sw_users SET full_name = ?, bio = ? WHERE id = ?", [
      fn,
      bioStr || null,
      userId,
    ]);
    return await getUserById(userId);
  } catch (err) {
    console.error(err);
    return { saveError: "Could not update profile." };
  }
}

/**
 * @param {string} userId
 * @param {string | null} [weatherFilter] Clear | Rain | Clouds
 */
export async function getWardrobe(userId, weatherFilter = null) {
  if (weatherFilter && WEATHER_OPTIONS.has(weatherFilter)) {
    const rows = await query(
      `SELECT id, name, description, weather, category, img FROM sw_clothes
       WHERE user_id = ? AND weather = ? ORDER BY created_at DESC`,
      [userId, weatherFilter]
    );
    return rows.map(mapClothingRow);
  }
  const rows = await query(
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
    await query(
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

/**
 * @returns {Promise<{ id: string, name: string, description: string, weather: string, category: string, img: string } | { saveError: string } | null>}
 */
export async function updateClothingItem(userId, itemId, item) {
  try {
    await query(
      `UPDATE sw_clothes
       SET name = ?, description = ?, weather = ?, category = ?, img = ?
       WHERE id = ? AND user_id = ?`,
      [
        item.name,
        item.description,
        item.weather,
        item.category,
        item.img,
        itemId,
        userId,
      ]
    );
    const rows = await query(
      `SELECT id, name, description, weather, category, img FROM sw_clothes
       WHERE id = ? AND user_id = ?`,
      [itemId, userId]
    );
    return rows[0] ? mapClothingRow(rows[0]) : null;
  } catch (err) {
    console.error(err);
    return { saveError: "Could not update item." };
  }
}

/**
 * @returns {Promise<{ ok: true } | { ok: false, saveError: string }>}
 */
export async function deleteClothingItem(userId, itemId) {
  try {
    await query("DELETE FROM sw_clothes WHERE id = ? AND user_id = ?", [
      itemId,
      userId,
    ]);
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, saveError: "Could not delete item." };
  }
}
