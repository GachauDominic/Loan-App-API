import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

export const db = drizzle(migrationClient, { schema });
