import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema-sqlite";
import path from 'path';

// Use SQLite database file, create if it doesn't exist
const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || path.join(process.cwd(), 'database.db');
const sqlite = new Database(dbPath);

// Enable foreign keys for SQLite
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });