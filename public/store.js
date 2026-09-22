/* Where reports live.
 *
 * Three modes, picked at runtime:
 *   supabase  — config.js has credentials. Works on GitHub Pages. Real storage.
 *   server    — the local Node server is answering /api. Used while developing.
 *   preview   — neither. Shows demo-data.json and refuses to pretend it saved.
 */
window.Store = (function () {
  'use strict';

  var cfg = window.BIKEMAP_CONFIG || {};
  var mode = 'unknown';
  var sb = null;

  var COLUMNS = 'id,lat,lng,occurred_on,time_of_day,bike_type,lock_type,parked_at,failure_mode,notes';

  if (cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    mode = 'supabase';
  }

  // A per-browser id, so the database can throttle one person spamming pins.
  // Clearable by anyone determined; the point is to stop the casual case.
  function reporterId() {
    var k = 'sbt-reporter';
    var v = localStorage.getItem(k);
    if (!v) {
      v = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
      localStorage.setItem(k, v);
    }
    return v;
  }

  function fromSupabase() {
    return sb.from('thefts').select(COLUMNS).eq('status', 'published')
      .order('occurred_on', { ascending: false }).limit(5000)
      .then(function (r) {
        if (r.error) throw r.error;
        return r.data || [];
      });
  }

  function fromServer() {
    return fetch('api/thefts')
      .then(function (r) {
        if (!r.ok) throw new Error('no api');
        return r.json();
      })
      .then(function (d) { mode = 'server'; return d.thefts || []; });
  }

  function fromDemoFile() {
    return fetch('demo-data.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (d) { mode = 'preview'; return d.thefts || d || []; })
      .catch(function () { mode = 'preview'; return []; });
  }

  function list() {
    if (mode === 'supabase') return fromSupabase();
    return fromServer().catch(fromDemoFile);
  }

  function add(report) {
    if (mode === 'supabase') {
      var row = {
        lat: report.lat, lng: report.lng, occurred_on: report.occurred_on,
        time_of_day: report.time_of_day, bike_type: report.bike_type,
        lock_type: report.lock_type, parked_at: report.parked_at,
        failure_mode: report.failure_mode,
        notes: report.notes || '', reporter: reporterId(), hp: report.website || '',
      };
      return sb.from('thefts').insert(row).select(COLUMNS).single()
        .then(function (r) {
          if (r.error) throw new Error(friendly(r.error));
          return r.data;
        });
    }

    if (mode === 'preview') {
      return Promise.reject(new Error('PREVIEW'));
    }

    return fetch('api/thefts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d.error || 'Could not save that.');
        return d.theft;
      });
    });
  }

  // Postgres constraint names are not something to show a person.
  function friendly(err) {
    var m = (err && (err.message || err.details) || '').toLowerCase();
    if (m.indexOf('rate') > -1 || m.indexOf('too many') > -1) return 'RATE';
    if (m.indexOf('bbox') > -1 || m.indexOf('lat') > -1 || m.indexOf('lng') > -1) return 'BBOX';
    if (m.indexOf('date') > -1 || m.indexOf('occurred') > -1) return 'DATE';
    if (m.indexOf('duplicate') > -1 || m.indexOf('unique') > -1) return 'DUPLICATE';
    return 'SAVE';
  }

  return {
    list: list,
    add: add,
    mode: function () { return mode; },
  };
})();
