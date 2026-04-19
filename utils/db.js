// Same style as class (07_next_fullstack/utils/db.js). Env vars optional for deploy.
const mysql = require("mysql2");

export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "u6708134_csc350",
});
