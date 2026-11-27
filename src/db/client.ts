import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const databaseUrl = process.env.DATABASE_URL;

export const sql = databaseUrl
  ? postgres(databaseUrl, { max: 1, prepare: false, ssl: "require" })
  : null;

export const db = sql ? drizzle(sql) : null;
