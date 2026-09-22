'use strict';

// Bike Theft Map — Tel Aviv
// Zero-dependency Node server. Requires Node >= 22.5 (built-in node:sqlite).

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const { migrate, snap } = require('./schema.js');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DB_PATH = process.env.DB_PATH || path.join(ROOT, 'data', 'thefts.db');

// Greater Tel Aviv / Gush Dan bounding box. Reports outside are rejected.
const BBOX = { minLat: 31.95, maxLat: 32.25, minLng: 34.68, maxLng: 34.95 };

// ---------------------------------------------------------------- database

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

migrate(db);

// The dedupe / rate-limit key is a salted hash, so the database never holds a
// raw IP address. The salt is generated once and lives next to the database.
const SALT_PATH = path.join(path.dirname(DB_PATH), '.reporter-salt');
let SALT;
try {
  SALT = fs.readFileSync(SALT_PATH, 'utf8').trim();
} catch {
  SALT = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SALT_PATH, SALT + '\n', { mode: 0o600 });
}

// ---------------------------------------------------------------- helpers

const ENUMS = {
  time_of_day: ['morning', 'afternoon', 'evening', 'night', 'unknown'],
  bike_type: ['city', 'electric', 'road', 'mountain', 'scooter', 'other', 'unknown'],
  lock_type: ['none', 'cable', 'chain', 'ulock', 'folding', 'unknown'],
  parked_at: ['street', 'rack', 'building', 'courtyard', 'other', 'unknown'],
  // What actually gave way. A cut cable and a cut lamp post are the same
  // theft on paper and completely different warnings on the street.
  failure_mode: ['lock_cut', 'lock_opened', 'anchor_cut', 'anchor_removed', 'not_locked', 'unknown'],
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function clientKey(req) {
  const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const raw = fwd || req.socket.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(SALT + '|' + raw).digest('hex').slice(0, 32);
}

// Simple in-memory rate limit: N *accepted* reports per window, per client.
// Only successful inserts count, so someone fumbling the form a few times
// doesn't lock themselves out of reporting a real theft.
const RATE = { windowMs: 60 * 60 * 1000, max: 5 };
const hits = new Map();

function recent(key) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < RATE.windowMs);
  hits.set(key, list);
  return list;
}

function atLimit(key) {
  return recent(key).length >= RATE.max;
}

function recordAccepted(key) {
  recent(key).push(Date.now());
}

function readBody(req, limit = 8 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let done = false;
    const chunks = [];
    req.on('data', (c) => {
      if (done) return;
      size += c.length;
      if (size > limit) {
        done = true;
        // Stop buffering but keep the socket alive long enough to answer,
        // otherwise the client sees a dropped connection instead of a reason.
        reject(Object.assign(new Error('payload too large'), { code: 'TOO_LARGE' }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => { if (!done) resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', reject);
  });
}

function validateReport(input) {
  const errors = [];
  const lat = Number(input.lat);
  const lng = Number(input.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    errors.push('Missing map location.');
  } else if (lat < BBOX.minLat || lat > BBOX.maxLat || lng < BBOX.minLng || lng > BBOX.maxLng) {
    errors.push('That pin is outside the Tel Aviv area this map covers.');
  }

  const occurred = String(input.occurred_on || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurred)) {
    errors.push('Pick the date it was stolen.');
  } else {
    const then = new Date(`${occurred}T12:00:00Z`);
    const now = new Date();
    if (Number.isNaN(then.getTime())) errors.push('That date is not valid.');
    else if (then.getTime() > now.getTime() + 86400000) errors.push('That date is in the future.');
    else if (now.getTime() - then.getTime() > 5 * 365 * 86400000) errors.push('That date is more than 5 years ago.');
  }

  // Only the pin and the date are required. A detail left blank becomes
  // 'unknown'; a detail that isn't on the list is a client bug, and rejected.
  const picked = {};
  for (const [field, allowed] of Object.entries(ENUMS)) {
    const value = String(input[field] || '').trim();
    if (!value) picked[field] = 'unknown';
    else if (allowed.includes(value)) picked[field] = value;
    else errors.push(`"${value}" is not a valid ${field.replace(/_/g, ' ')}.`);
  }

  const notes = String(input.notes || '').replace(/\s+/g, ' ').trim().slice(0, 280);

  // Snapped before anything else touches it: the precise tap never gets stored.
  return {
    errors,
    row: { lat: snap(lat), lng: snap(lng), occurred_on: occurred, notes, ...picked },
  };
}

// ---------------------------------------------------------------- routes

const selectAll = db.prepare(`
  SELECT id, lat, lng, occurred_on, time_of_day, bike_type, lock_type, parked_at, failure_mode, notes, source
  FROM thefts WHERE status = 'published' ORDER BY occurred_on DESC, id DESC
`);

const insertReport = db.prepare(`
  INSERT INTO thefts (lat, lng, occurred_on, time_of_day, bike_type, lock_type, parked_at, failure_mode, notes, source, status, reporter_key, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?, ?, ?)
`);

// Coordinates are already snapped to the grid, so the same cell on the same
// day from the same reporter is the duplicate case.
const findDuplicate = db.prepare(`
  SELECT id FROM thefts
  WHERE reporter_key = ? AND occurred_on = ?
    AND ABS(lat - ?) < 0.0005 AND ABS(lng - ?) < 0.0005
  LIMIT 1
`);

function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/thefts') {
    const rows = selectAll.all().map((r) => ({ ...r, lat: round(r.lat), lng: round(r.lng) }));
    return send(res, 200, { count: rows.length, bbox: BBOX, thefts: rows });
  }

  if (req.method === 'POST' && url.pathname === '/api/thefts') {
    const key = clientKey(req);
    if (atLimit(key)) {
      return send(res, 429, { error: 'Too many reports from this connection. Try again later.' });
    }
    return readBody(req)
      .then((raw) => {
        let input;
        try {
          input = JSON.parse(raw || '{}');
        } catch {
          return send(res, 400, { error: 'Malformed request.' });
        }
        const { errors, row } = validateReport(input);
        if (errors.length) return send(res, 400, { error: errors[0], errors });
        if (findDuplicate.get(key, row.occurred_on, row.lat, row.lng)) {
          return send(res, 409, { error: 'You already reported a theft at that spot on that date.' });
        }
        // Honeypot: the form ships a field no human can see. Anything that
        // fills it is a bot. Store it hidden rather than erroring, so the
        // script gets a 201 and never learns it was caught.
        const status = String(input.website || '').trim() ? 'hidden' : 'published';

        recordAccepted(key);
        const info = insertReport.run(
          row.lat, row.lng, row.occurred_on, row.time_of_day, row.bike_type,
          row.lock_type, row.parked_at, row.failure_mode, row.notes, status, key,
          new Date().toISOString(),
        );
        const id = Number(info.lastInsertRowid);
        return send(res, 201, { id, theft: { id, source: 'user', ...row } });
      })
      .catch((e) => {
        if (e && e.code === 'TOO_LARGE') {
          send(res, 413, { error: 'That report is too large.' });
          req.destroy();
          return;
        }
        send(res, 400, { error: 'Could not read that request.' });
      });
  }

  return send(res, 404, { error: 'Not found' });
}

function round(n) {
  return Math.round(n * 1e5) / 1e5;
}

// ---------------------------------------------------------------- static

function serveStatic(req, res, url) {
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
  const file = path.join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });

  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    send(res, 200, data, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  return serveStatic(req, res, url);
});

server.listen(PORT, () => {
  const n = db.prepare('SELECT COUNT(*) AS n FROM thefts').get().n;
  console.log(`Bike Theft Map — Tel Aviv`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  db: ${DB_PATH} (${n} report${n === 1 ? '' : 's'})`);
});
