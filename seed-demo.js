'use strict';

// SYNTHETIC demo data — invented, not real theft reports.
// Purpose: see what a populated map looks like before you have real users.
//   node seed-demo.js          → insert ~90 fake reports (source = 'demo')
//   node seed-demo.js --clear  → delete every demo row, leave real ones alone
//   node seed-demo.js --export → write public/demo-data.json for local preview
//   node seed-demo.js --blank  → empty that file again before you commit

const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { migrate, snap } = require('./schema.js');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'thefts.db');
require('node:fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
migrate(db);

if (process.argv.includes('--blank')) {
  const out = path.join(__dirname, 'public', 'demo-data.json');
  require('node:fs').writeFileSync(out, '{"thefts":[]}\n');
  console.log(`Emptied ${out}. The published site will show no pins.`);
  process.exit(0);
}

if (process.argv.includes('--export')) {
  const rows = db.prepare(`
    SELECT id, lat, lng, occurred_on, time_of_day, bike_type, lock_type, parked_at, failure_mode, notes
    FROM thefts WHERE status = 'published' ORDER BY occurred_on DESC
  `).all().map((r) => ({ ...r }));
  const out = path.join(__dirname, 'public', 'demo-data.json');
  require('node:fs').writeFileSync(out, JSON.stringify({ thefts: rows }, null, 0) + '\n');
  console.log(`Wrote ${rows.length} reports to ${out}.`);
  console.log('Local preview only — run `npm run blank` before committing,');
  console.log('so the published site never shows invented reports as real ones.');
  process.exit(0);
}

if (process.argv.includes('--clear')) {
  const before = db.prepare("SELECT COUNT(*) n FROM thefts WHERE source='demo'").get().n;
  db.exec("DELETE FROM thefts WHERE source='demo'");
  console.log(`Removed ${before} demo rows.`);
  process.exit(0);
}

// Loose clusters around real neighbourhoods, with invented weights.
const ZONES = [
  { name: 'Florentin',        lat: 32.0553, lng: 34.7679, spread: 0.0045, weight: 16 },
  { name: 'Rothschild',       lat: 32.0655, lng: 34.7745, spread: 0.0040, weight: 13 },
  { name: 'Dizengoff Center', lat: 32.0753, lng: 34.7745, spread: 0.0035, weight: 12 },
  { name: 'Old North',        lat: 32.0880, lng: 34.7760, spread: 0.0055, weight: 11 },
  { name: 'Ramat Aviv / TAU', lat: 32.1133, lng: 34.8045, spread: 0.0050, weight: 9 },
  { name: 'Neve Tzedek',      lat: 32.0620, lng: 34.7620, spread: 0.0030, weight: 8 },
  { name: 'Port / Namal',     lat: 32.0975, lng: 34.7745, spread: 0.0035, weight: 7 },
  { name: 'Jaffa / Yefet',    lat: 32.0510, lng: 34.7540, spread: 0.0050, weight: 7 },
  { name: 'Levinsky',         lat: 32.0575, lng: 34.7780, spread: 0.0035, weight: 9 },
  { name: 'Sarona / Azrieli', lat: 32.0715, lng: 34.7885, spread: 0.0040, weight: 6 },
];

const TIME = ['night', 'night', 'night', 'evening', 'evening', 'afternoon', 'morning', 'unknown'];
const BIKE = ['electric', 'electric', 'electric', 'city', 'city', 'road', 'mountain', 'scooter', 'other'];
const LOCK = ['cable', 'cable', 'chain', 'ulock', 'none', 'none', 'folding', 'unknown'];
const PARK = ['street', 'street', 'street', 'rack', 'building', 'courtyard', 'other'];
const FAIL = ['lock_cut', 'lock_cut', 'lock_cut', 'lock_cut', 'anchor_cut', 'anchor_cut',
              'anchor_removed', 'lock_opened', 'not_locked', 'unknown'];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const jitter = (c, s) => c + (Math.random() + Math.random() + Math.random() - 1.5) * s;

const insert = db.prepare(`
  INSERT INTO thefts (lat, lng, occurred_on, time_of_day, bike_type, lock_type, parked_at, failure_mode, notes, source, reporter_key, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo', 'seed', ?)
`);

let n = 0;
for (const z of ZONES) {
  for (let i = 0; i < z.weight; i++) {
    const daysBack = Math.floor(Math.pow(Math.random(), 1.6) * 400);
    const when = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10);
    insert.run(
      snap(jitter(z.lat, z.spread)), snap(jitter(z.lng, z.spread)), when,
      pick(TIME), pick(BIKE), pick(LOCK), pick(PARK), pick(FAIL),
      '', new Date().toISOString(),
    );
    n++;
  }
}

console.log(`Inserted ${n} SYNTHETIC demo reports into ${DB_PATH}.`);
console.log(`Remove them any time with:  node seed-demo.js --clear`);
