import mysql from "mysql2/promise";

// Class-style pool config; uses env when set (see env.mysql.example).
// mysql2/promise fits async Next.js route handlers (await pool.execute(...)).
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "localhost",
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "u6708134_csc350",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
