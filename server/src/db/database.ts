import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'smartwaste.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON;');

export function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
}

export function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

export function run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export async function initDatabase(): Promise<void> {
  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_info TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'collector', 'admin')),
      verified INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      streak_count INTEGER NOT NULL DEFAULT 0,
      badges TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    )
  `);

  // Requests table
  await run(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      waste_category TEXT NOT NULL CHECK(waste_category IN ('Organic', 'Plastic', 'Paper', 'E-Waste', 'Medical', 'Other')),
      pickup_location TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      photo_exif_present INTEGER NOT NULL DEFAULT 0,
      photo_gps_match INTEGER DEFAULT NULL,
      status TEXT NOT NULL CHECK(status IN ('Submitted', 'Assigned', 'On the Way', 'Completed', 'Rejected')),
      rejection_reason TEXT DEFAULT NULL,
      collector_id TEXT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Ratings table (Bidirectional: rater_role is 'user' or 'collector')
  await run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      rater_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rater_role TEXT NOT NULL CHECK(rater_role IN ('user', 'collector')),
      target_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT DEFAULT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Badges reference table
  await run(`
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      min_points INTEGER NOT NULL DEFAULT 0,
      min_streak INTEGER NOT NULL DEFAULT 0
    )
  `);

  console.log('Database tables verified and initialized.');
}

export default db;
