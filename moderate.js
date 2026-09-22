'use strict';

// Moderation for the map. Reports publish immediately — this is how you take
// junk back down after the fact.
//
//   node moderate.js list [n]     newest n reports (default 25)
//   node moderate.js hidden       everything currently hidden
//   node moderate.js hide <id...> take reports off the map
//   node moderate.js show <id...> put them back
//   node moderate.js purge <id>   hide every report from the same reporter
//   node moderate.js stats        counts by status, source and neighbourhood spread

const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { migrate } = require('./schema.js');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'thefts.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
migrate(db);

const HELP = `Moderation for the map. Reports publish immediately — this is how you
take junk back down afterwards.

  node moderate.js list [n]      newest n reports (default 25)
  node moderate.js hidden        everything currently hidden
  node moderate.js hide <id...>  take reports off the map
  node moderate.js show <id...>  put them back
  node moderate.js purge <id>    hide every report from the same reporter
  node moderate.js stats         counts by status and source, plus clustering`;

const [cmd, ...args] = process.argv.slice(2);
const ids = args.filter((a) => /^\d+$/.test(a)).map(Number);

function row(r) {
  const flag = r.status === 'published' ? ' ' : '✕';
  const note = r.notes ? `  “${r.notes.slice(0, 44)}${r.notes.length > 44 ? '…' : ''}”` : '';
  return `${flag} #${String(r.id).padEnd(5)} ${r.occurred_on}  ${r.lat.toFixed(3)},${r.lng.toFixed(3)}  ` +
         `${r.bike_type.padEnd(9)}${r.lock_type.padEnd(8)}${r.source.padEnd(6)}${note}`;
}

switch (cmd) {
  case 'list': {
    const n = Number(args[0]) || 25;
    const rows = db.prepare('SELECT * FROM thefts ORDER BY id DESC LIMIT ?').all(n);
    rows.forEach((r) => console.log(row(r)));
    console.log(`\n${rows.length} shown. ✕ = hidden from the map.`);
    break;
  }

  case 'hidden': {
    const rows = db.prepare("SELECT * FROM thefts WHERE status <> 'published' ORDER BY id DESC").all();
    rows.forEach((r) => console.log(row(r)));
    console.log(`\n${rows.length} hidden.`);
    break;
  }

  case 'hide':
  case 'show': {
    if (!ids.length) return fail(`Give at least one id, e.g. node moderate.js ${cmd} 42 43`);
    const status = cmd === 'hide' ? 'hidden' : 'published';
    const stmt = db.prepare('UPDATE thefts SET status = ? WHERE id = ?');
    let n = 0;
    for (const id of ids) n += stmt.run(status, id).changes;
    console.log(`${n} report${n === 1 ? '' : 's'} now ${status}.`);
    break;
  }

  case 'purge': {
    if (ids.length !== 1) return fail('Give exactly one id: node moderate.js purge 42');
    const seed = db.prepare('SELECT reporter_key FROM thefts WHERE id = ?').get(ids[0]);
    if (!seed) return fail(`No report #${ids[0]}.`);
    if (!seed.reporter_key) return fail('That report has no reporter key to match on.');
    const n = db.prepare("UPDATE thefts SET status = 'hidden' WHERE reporter_key = ?").run(seed.reporter_key).changes;
    console.log(`Hid ${n} report${n === 1 ? '' : 's'} from the same reporter as #${ids[0]}.`);
    break;
  }

  case 'stats': {
    const by = (col) => db.prepare(`SELECT ${col} k, COUNT(*) n FROM thefts GROUP BY ${col} ORDER BY n DESC`).all();
    console.log('status:', by('status').map((r) => `${r.k}=${r.n}`).join('  '));
    console.log('source:', by('source').map((r) => `${r.k}=${r.n}`).join('  '));
    const cells = db.prepare("SELECT COUNT(DISTINCT lat || ',' || lng) n FROM thefts WHERE status='published'").get().n;
    const total = db.prepare("SELECT COUNT(*) n FROM thefts WHERE status='published'").get().n;
    console.log(`spread: ${total} published reports across ${cells} distinct ~100 m cells`);
    if (total && cells / total < 0.35) console.log('  ⚠  heavily clustered — worth checking for one person spamming a spot');
    break;
  }

  default:
    console.log(HELP);
}

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
}
