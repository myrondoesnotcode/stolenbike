# Stolen Bikes TLV

A crowdsourced map of where bikes get stolen in Tel Aviv. Anyone can drop a pin —
no account, no email. The point isn't to catch anyone; it's to make the pattern
visible so people can see which streets and which hours are actually bad.

English and Hebrew, with the whole layout mirroring for RTL — including the
geocoder, which answers in whichever language is on screen.

---

## Putting it online (GitHub Pages)

GitHub Pages only serves files. It cannot store anything, so the reports need a
database somewhere else. Supabase gives you a free Postgres with a public API,
which is exactly the missing half.

### 1. Make the database

1. Create a project at [supabase.com](https://supabase.com) (free, no card).
2. Open **SQL Editor**, paste all of [supabase/setup.sql](supabase/setup.sql), run it.
3. Open **Project Settings → API Keys** and copy the **Project URL** and the
   **publishable** key (`sb_publishable_…`). Never the secret one — it bypasses
   row-level security, and this value ends up in a public web page.

### 2. Point the site at it

```bash
npm run connect -- <project-url> <publishable-key>
```

That writes both into [public/config.js](public/config.js). It refuses a secret
key. Commit and push, and the site rebuilds itself in about a minute.

One thing worth knowing about the schema: `reporter` and the honeypot column are
readable by nobody, enforced with column-level grants rather than row policies.
A consequence is that an insert must name the columns it wants back —
`return=representation` with no column list asks for every column and is denied.
`store.js` already names them.

Both are meant to be public — the anon key is designed to sit in a web page, and
the database's row-level security is what actually protects the data. Committing
them is fine.

### 3. Turn Pages on

Push to `main`, then in the repo: **Settings → Pages → Source: GitHub Actions**.
The workflow in [.github/workflows/pages.yml](.github/workflows/pages.yml)
publishes `public/` on every push. Your map lands at
`https://<user>.github.io/<repo>/`.

**With no credentials configured the site still works** — it shows the demo data
read-only and says so, rather than silently dropping reports.

---

## Placing the pin

Getting the location right is the hard part of the form, so it is its own step:

1. Tap **Report a stolen bike** and the browser asks for your location. Allow it
   and the map flies to where you are.
2. Denied it, or reporting from somewhere else? Search a street, corner or place
   — results are limited to Gush Dan and deduplicated, since a long street comes
   back from the geocoder once per segment.
3. Or just tap the map.

Either way you end up with a draggable teardrop pin at street zoom, framed below
the panel rather than behind it. Drag it to the exact spot, and the bar names the
street back to you so you can tell you got it right. **This is the spot** moves
on to the details.

Searching goes through [Photon](https://photon.komoot.io), because it tolerates
typos and people transliterating Hebrew street names produce a lot of them.
"Trumpledor 17" — l and e swapped — returns **nothing** from an exact-match
geocoder; Photon returns Trumpeldor 17, Lev Tel Aviv, first hit. It is also
biased by the current map centre, so the Tel Aviv street outranks the four other
Trumpeldors in Gush Dan.

[Nominatim](https://nominatim.org/) stays as a fallback if Photon is
unreachable. Both are free, keyless, shared community services — searches are
debounced to one request per query, but if this ever gets real traffic, move to
a paid geocoder rather than leaning on them.

## What a report asks for

Only two things are required: **where** and **when**. Everything else is
optional and stores as `unknown` if skipped — asking for detail is fine,
demanding it just loses reports.

The question that matters most is **"What gave way?"**, because "cable lock"
and "cut lamp post" are the same theft on paper and completely different
warnings on the street:

| Answer | What it tells the next person |
|--------|-------------------------------|
| They cut the lock | Your lock is the weak point |
| They cut what it was locked to | That pole/rack is the weak point |
| They removed what it was locked to | Someone unbolted the whole anchor |
| The lock was opened, not broken | Picked or a key — no noise, no mess |
| It was not locked | — |

It shows on the pin's popup in its own colour, because it is usually the most
actionable line there.

## "How bad is it around here?"

Asks for your location (falls back to the middle of the map, and says so), draws
a 250 m circle, and reports what's inside it.

It is deliberately **not** a safety score. Nobody counts the bikes that were
parked and came back fine, so there is no denominator and no honest way to
print "safe". What the data can answer is *relative*: how much gets reported
around this spot compared with everywhere else on the map.

- Reports are weighted by recency — last 90 days count full, older ones taper to
  a third — because a theft last month says more about today than one from 2022.
- The yardstick is the same weighted count measured at every other report on the
  map, so "busier than 80% of the places on this map" is a true statement.
- Bands run *Quieter than most → About average → Busier than most → Hotspot*.
  There is no green tier, on purpose: a quiet square is an under-reported one,
  not a certified one.
- An area with nothing in it says so plainly rather than implying safety.
- It also names the most common answer to "what gave way" nearby, which is the
  actionable part — "most often here: they cut what it was locked to" tells you
  something a count never will.

## Location

There's a crosshair button under the zoom controls that centres the map on you
and drops a blue "you are here" dot — deliberately unlike a theft pin.

Once someone denies location, a page can never ask again; only browser settings
can undo it. So the code checks `navigator.permissions` and says the thing that
actually helps: *"Tap the ⌖ button"* when it can still prompt, and *"Location is
blocked for this site — allow it in your browser settings"* when it can't.

## The byline

"Made by …" in both footers, from `authorName` / `authorUrl` in `config.js`.

Getting a LinkedIn link into the **app** rather than a browser tab has no single
answer, so `byline.js` routes by user agent:

| Where | What it sends |
|-------|---------------|
| Desktop | plain https, new tab |
| Android | an `intent:` URL naming `com.linkedin.android`, with the https address as `browser_fallback_url` — opens the app, falls back to the site, never errors |
| iOS, real browser | plain https. That's a Universal Link; iOS hands it to the app itself. Firing a custom scheme here would only risk an error dialog for people without the app |
| iOS, in-app browser (Instagram, Facebook…) | `linkedin://in/<handle>`, falling back to https after 900 ms if the page is still open |

That last row is the one that matters for story traffic: Universal Links usually
do **not** fire inside Instagram's web view. The `href` stays the real web
address in every case, so copying the link or long-pressing it still works.

`renderByline.routeFor(userAgent, url)` is pure, so the routing can be checked
against any user-agent string without a device.

## What the database enforces

All of it lives in Postgres, so it holds no matter what a client sends:

- **Location is blurred on the way in.** Coordinates are snapped to a ~100 m grid
  before storage, so a pin can never point at one building. The map scatters each
  dot inside its own cell for legibility — it never shows more precision than it
  keeps.
- Pins outside the Gush Dan box are rejected; so are dates in the future or more
  than five years old, and any category value that isn't on the list.
- Notes are collapsed and capped at 280 characters.
- Five accepted reports per hour per browser; the same cell on the same day from
  the same browser is refused as a duplicate.
- The form carries a honeypot field no human can see. Anything that fills it is
  saved **hidden** rather than rejected, so the script never learns it was caught.
- `reporter` and the honeypot are never readable by the public — enforced with
  column-level grants, not just row policies.

The per-browser id lives in localStorage, so someone determined can clear it and
report again. That's the known ceiling: it stops casual spam, not a motivated
person. The upgrade when you need it is Cloudflare Turnstile on submit.

### Moderating

Reports publish immediately. To take one down, in the Supabase SQL editor:

```sql
update public.thefts set status = 'hidden' where id = 123;
```

---

## Running it locally

The Node server is for development — it gives you the same API without touching
Supabase, so you can work offline.

```bash
npm start           # http://localhost:3000
```

No dependencies. Node 22.5+ only (built-in `node:sqlite`). Data goes to
`data/thefts.db`, which is gitignored.

```bash
npm run seed        # ~98 SYNTHETIC reports across 10 neighbourhoods
npm run unseed      # removes only the demo rows
npm run export      # regenerates public/demo-data.json from them
node moderate.js    # list / hide / show / purge / stats
```

The demo reports are **invented**, not real. They exist so the map isn't empty
while you build. `public/demo-data.json` is what the published site falls back to
before a database is connected — regenerate it if you change the seed.

## Layout

| Path | What it is |
|------|-----------|
| `public/` | The entire site. This is what GitHub Pages serves. |
| `public/index.html` | The landing page — the link you actually share. |
| `public/map.html` | The map itself. |
| `public/doodles.js` | The ink drawings, as inline SVG. |
| `public/tokens.css` | The palette, shared by both pages. |
| `public/store.js` | Picks the data source: Supabase, local server, or preview. |
| `public/config.js` | Your Supabase credentials. |
| `supabase/setup.sql` | The database: table, constraints, triggers, policies. |
| `server.js` | Local dev API. Not used in production. |
| `schema.js`, `seed-demo.js`, `moderate.js` | Local dev database tooling. |

### Looks

Both pages are the same material: light paper, dark ink, terracotta for the one
loud thing. The palette is in `public/tokens.css` and nowhere else — the map and
the landing page both read from it, so a colour changes in one place. The map
tiles are plain OpenStreetMap run through a sepia filter so the map and the panel
look like the same sheet of paper.

The map sidebar keeps only what you need at a glance — the report button, three
numbers, and how many pins are shown. Filters and the breakdown live behind the
**Filter** button, closed by default.

### The landing page

`/` is a cork noticeboard: a taped-up STOLEN flyer, pinned index cards for the
live counts, a hand-tallied league table of neighbourhoods, and a wall of cut
locks. It reads the same data the map does, so the numbers on the front door are
the real ones — or the demo ones, labelled as such.

Nothing is a stock icon. The drawings are plain SVG paths in `doodles.js` run
through one `feTurbulence` displacement filter, which is where the wobble comes
from — one filter over everything keeps it looking like one pen. Neighbourhood
names come from the nearest of fifteen hardcoded centres in `landing.js`, and
only if the pin is within 1.3 km; anything further sits out of the table rather
than being forced into a neighbourhood it isn't in.

---

## Is there data to import?

Checked, September 2026. Short answer: no.

- **[Bike Index](https://bikeindex.org)** is the only real stolen-bike registry
  with an open API and coordinates. Within 60 km of Tel Aviv it holds **6**
  stolen records, of which about three are actually in the city, and its
  coordinates are rounded to two decimals — roughly 1.1 km, deliberately coarse.
  Three blurry pins is not a populated map.
- **data.gov.il** has sixteen datasets matching "אופניים": bike paths, parking
  racks, and e-bike licence exam questions. No thefts.
- **Israel Police** publishes crime counts by locality and quarter. Aggregate,
  no coordinates, and bicycles are not broken out. Placing those on a map would
  mean inventing the locations, which is the one thing this project cannot do.

So the first fifty pins have to come from people. That is the launch, not a
detail of it.

Worth noting: Bike Index records carry `locking_description` and
`lock_defeat_description` fields — the same distinction as "what gave way".
Independent confirmation that it is the question worth asking.

## Before you post the link

1. **Empty maps convert nobody.** Get 30–50 real pins from friends and the
   cycling groups before it goes wide, so the first visitor sees a pattern
   instead of a blank page.
2. **Check it on a phone first.** Most people will open it from a story link.
3. **Watch the first day.** `select count(*) from public.thefts;` and a look at
   recent rows tells you fast whether anyone is playing with it.
