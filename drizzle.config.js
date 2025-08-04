/** @type { import("drizzle-kit").Config } */
require('dotenv').config();

const config = {
  schema: "./lib/db/schema.js",
  out: "./lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};

module.exports = config; 