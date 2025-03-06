const { Client } = require("pg");
require("dotenv").config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

db.connect().catch((err) => console.error("Database connection error:", err));

module.exports = db;
