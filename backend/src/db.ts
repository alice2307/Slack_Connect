import Database from "better-sqlite3";
import path from "path";

// Ensure database is created in the backend directory
const dbPath = path.join(__dirname, "../data.db");
const db: any = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log(`Initializing database at: ${dbPath}`);

db.exec(`
CREATE TABLE IF NOT EXISTS oauth_tokens (
  team_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  bot_user_id TEXT,
  authed_user_id TEXT
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  text TEXT NOT NULL,
  send_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT
);
`);

console.log("Database tables created successfully");

export default db;
