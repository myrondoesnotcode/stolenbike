'use strict';

// Point the published site at a Supabase project.
//
//   npm run connect -- https://xxxx.supabase.co eyJhbGciOi...
//
// Writes the two values into public/config.js. Both are meant to be public —
// the anon key is designed to sit in a web page, and the database's row-level
// security is what actually guards the data.

const fs = require('node:fs');
const path = require('node:path');

const [url, key] = process.argv.slice(2);
const CONFIG = path.join(__dirname, 'public', 'config.js');

function die(msg) {
  console.error(msg);
  console.error('\nUsage: npm run connect -- <project-url> <anon-key>');
  console.error('Both are in Supabase under Project Settings → API.');
  process.exit(1);
}

if (!url || !key) die('Need both the project URL and the anon key.');
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
  die(`That does not look like a Supabase project URL: ${url}`);
}
if (!/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(key)) {
  die('That does not look like an anon key (it should start with "eyJ").');
}
// The service_role key must never reach a web page — it bypasses row-level
// security entirely.
try {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString());
  if (claims.role && claims.role !== 'anon') {
    die(`That is the "${claims.role}" key. Use the anon / public one — anything else\n` +
        'would give every visitor full access to the database.');
  }
} catch { /* opaque key, let it through */ }

let src = fs.readFileSync(CONFIG, 'utf8');
src = src.replace(/supabaseUrl: '[^']*'/, `supabaseUrl: '${url.replace(/\/$/, '')}'`);
src = src.replace(/supabaseAnonKey: '[^']*'/, `supabaseAnonKey: '${key}'`);
fs.writeFileSync(CONFIG, src);

console.log(`Wrote both values to ${CONFIG}.`);
console.log('\nNow publish them:');
console.log('  git add public/config.js && git commit -m "Connect the database" && git push');
console.log('\nThe site rebuilds itself in about a minute. After that, reports save.');
