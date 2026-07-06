-- Run once to set up the database (safe to re-run — all use IF NOT EXISTS):
-- wrangler d1 execute poshak-feedback --remote --file schema.sql

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  uid        TEXT    NOT NULL,
  event      TEXT    NOT NULL,          -- 'visit' | 'score'
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  uid          TEXT,
  rating       INTEGER,                 -- 1–5 emoji rating
  thoughts     TEXT,                    -- JSON array of chip labels
  improvements TEXT,                    -- JSON array of chip labels
  comment      TEXT,                    -- free-text, max 1000 chars
  score        REAL,                    -- outfit score they received (0–10)
  created_at   DATETIME DEFAULT (datetime('now'))
);

-- Key-value store for admin-editable settings (e.g. live trend overrides)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at DATETIME DEFAULT (datetime('now'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_uid   ON events (uid);
CREATE INDEX IF NOT EXISTS idx_events_event ON events (event);
CREATE INDEX IF NOT EXISTS idx_events_ts    ON events (created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_ts  ON feedback (created_at);
