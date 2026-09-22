'use strict';

// Shared table definition, so the server, the seeder and the moderation CLI
// can all open a database that may not exist yet.

const TABLE = `
  CREATE TABLE IF NOT EXISTS thefts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    lat          REAL    NOT NULL,          -- snapped to a ~100 m grid, never exact
    lng          REAL    NOT NULL,
    occurred_on  TEXT    NOT NULL,          -- YYYY-MM-DD
    time_of_day  TEXT    NOT NULL,          -- morning|afternoon|evening|night|unknown
    bike_type    TEXT    NOT NULL,          -- city|electric|road|mountain|scooter|other
    lock_type    TEXT    NOT NULL,          -- none|cable|chain|ulock|folding|unknown
    parked_at    TEXT    NOT NULL,          -- street|rack|building|courtyard|other
    failure_mode TEXT    NOT NULL DEFAULT 'unknown',  -- what actually gave way
    notes        TEXT    NOT NULL DEFAULT '',
    source       TEXT    NOT NULL DEFAULT 'user',
    status       TEXT    NOT NULL DEFAULT 'published',  -- published|hidden
    reporter_key TEXT    NOT NULL DEFAULT '',           -- salted hash, never a raw IP
    created_at   TEXT    NOT NULL
  );
`;

// Indexes go in after the column migration below, since one of them names a
// column that older databases don't have yet.
const INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_thefts_occurred ON thefts(occurred_on);
  CREATE INDEX IF NOT EXISTS idx_thefts_source   ON thefts(source);
  CREATE INDEX IF NOT EXISTS idx_thefts_status   ON thefts(status);
`;

// Columns added after the first release, for databases that predate them.
const ADDED = [
  ['status', "TEXT NOT NULL DEFAULT 'published'"],
  ['failure_mode', "TEXT NOT NULL DEFAULT 'unknown'"],
];

function migrate(db) {
  db.exec(TABLE);
  const have = new Set(db.prepare('PRAGMA table_info(thefts)').all().map((c) => c.name));
  for (const [name, decl] of ADDED) {
    if (!have.has(name)) db.exec(`ALTER TABLE thefts ADD COLUMN ${name} ${decl}`);
  }
  db.exec(INDEXES);
}

// Coordinates are stored snapped to a grid so a pin can never point at one
// building — roughly 111 m north-south, 94 m east-west at this latitude.
const CELL = 0.001;

function snap(value) {
  return Math.round(Math.round(value / CELL) * CELL * 1e5) / 1e5;
}

module.exports = { migrate, snap, CELL };
