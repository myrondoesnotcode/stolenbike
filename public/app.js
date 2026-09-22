/* Stolen Bikes TLV — client */
(function () {
  'use strict';

  var TLV = [32.0793, 34.7805];

  // ------------------------------------------------------------------ i18n

  var OPTIONS = {
    time_of_day: ['morning', 'afternoon', 'evening', 'night', 'unknown'],
    bike_type: ['city', 'electric', 'road', 'mountain', 'scooter', 'other', 'unknown'],
    lock_type: ['ulock', 'chain', 'cable', 'folding', 'none', 'unknown'],
    parked_at: ['street', 'rack', 'building', 'courtyard', 'other', 'unknown'],
    failure_mode: ['lock_cut', 'anchor_cut', 'anchor_removed', 'lock_opened', 'not_locked', 'unknown'],
  };

  var STR = {
    en: {
      title: 'Stolen Bikes TLV', tagline: 'Where bikes actually disappear.',
      reportCta: 'Report a stolen bike',
      statTotal: 'reports', stat90: 'last 90 days', statZone: 'worst hour',
      filters: 'Filter', fPeriod: 'Time period', fBike: 'Bike type', fLock: 'Lock used',
      fHeat: 'Show heat layer', showing: 'pins shown',
      pAll: 'All time', p365: 'Last 12 months', p90: 'Last 90 days', p30: 'Last 30 days',
      anyType: 'Any type', anyLock: 'Any lock',
      breakdown: 'What gets taken',
      footNote: 'Crowdsourced and unverified. Pins are approximate — never post your home address.',
      useGps: 'Use my location',
      addrPh: 'Or search a street, corner or place',
      locateStart: 'You can also just tap the map.',
      locateDrag: 'Drag the pin to the exact spot it was locked.',
      locating: 'Finding you…',
      gpsDenied: 'Location is off. Search an address or tap the map instead.',
      gpsBlocked: 'Location is blocked for this site. Allow it in your browser settings (the lock icon next to the address), then try again.',
      gpsAsk: 'Tap the ⌖ button to use your location.',
      locateTitle: 'Show my location',
      backHome: 'Back to the front page',
      youAreHere: 'You are here',
      gpsFar: 'You are outside Tel Aviv right now — search the address instead.',
      searching: 'Searching…',
      noResults: 'Nothing found. Try a street name.',
      confirmSpot: 'This is the spot',
      areaCta: 'How bad is it around here?',
      areaWithin: 'reports within 250 m',
      areaCaveat: 'Based on what people reported. A quiet block may just be one nobody has reported in yet.',
      areaLocating: 'Finding you…',
      areaFromCentre: 'Using the middle of the map.',
      areaNone: "We're new, so nothing has been reported here yet. Lock up well anyway!",
      areaRank: 'Busier than {p}% of the places on this map.',
      areaRecent: '{n} of them in the last year.',
      areaHow: 'Most often here: {what}',
      bandNone: 'Nothing here yet',
      bandQuiet: 'Quieter than most',
      bandAverage: 'About average',
      bandBusy: 'Busier than most',
      bandHot: 'Hotspot',
      formTitle: 'Report a stolen bike', pinnedAt: 'Pinned at', repin: 'move pin',
      qDate: 'When was it stolen?', qTime: 'Time of day', qBike: 'Type of bike',
      qLock: 'Lock you used', qParked: 'Where was it parked?',
      qFail: 'What gave way?',
      fFail: 'What gave way', anyFail: 'Any way in',
      lock_cut: 'They cut the lock',
      anchor_cut: 'They cut what it was locked to',
      anchor_removed: 'They removed what it was locked to',
      lock_opened: 'The lock was opened, not broken',
      not_locked: 'It was not locked',
      qNotes: 'Anything else?', optional: '(optional)',
      notesPh: 'e.g. cut through the pole, 20:00–23:00',
      cancel: 'Cancel', submit: 'Add to map',
      privacy: 'No account, no email, nothing that identifies you is stored.',
      thanks: 'Added. Thanks — that pin helps everyone.',
      needDate: 'Pick the date it was stolen.', needPin: 'Drop a pin on the map first.',
      offline: 'Could not reach the server. Try again.',
      previewMode: 'Preview mode — reports are not being saved yet.',
      previewSave: 'Not saved: this map has no database connected yet.',
      rateMsg: 'That is a lot of reports at once. Try again later.',
      dupMsg: 'You already reported a theft at that spot on that date.',
      stolen: 'Stolen', noneYet: 'No reports yet — be the first.',
      morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night', unknown: 'Not sure',
      city: 'City bike', electric: 'E-bike', road: 'Road', mountain: 'Mountain', scooter: 'E-scooter', other: 'Other',
      ulock: 'U-lock', chain: 'Chain', cable: 'Cable', folding: 'Folding', none: 'No lock',
      street: 'Street pole', rack: 'Bike rack', building: 'Building entrance', courtyard: 'Courtyard',
      lockNone: 'unlocked',
    },
    he: {
      title: 'אופניים גנובים ת״א', tagline: 'איפה באמת נעלמים אופניים.',
      reportCta: 'דווח על אופניים שנגנבו',
      statTotal: 'דיווחים', stat90: '90 ימים אחרונים', statZone: 'שעה מסוכנת',
      filters: 'סינון', fPeriod: 'תקופה', fBike: 'סוג אופניים', fLock: 'סוג מנעול',
      fHeat: 'שכבת חום', showing: 'סימונים מוצגים',
      pAll: 'הכול', p365: '12 חודשים', p90: '90 ימים', p30: '30 ימים',
      anyType: 'כל הסוגים', anyLock: 'כל המנעולים',
      breakdown: 'מה נגנב',
      footNote: 'מידע מהקהילה, לא מאומת. הסימונים משוערים — אל תסמנו את כתובת הבית.',
      useGps: 'המיקום שלי',
      addrPh: 'או חפשו רחוב, פינה או מקום',
      locateStart: 'אפשר גם פשוט ללחוץ על המפה.',
      locateDrag: 'גררו את הסימון למקום המדויק שבו ננעלו.',
      locating: 'מאתר אתכם…',
      gpsDenied: 'שירותי המיקום כבויים. חפשו כתובת או לחצו על המפה.',
      gpsBlocked: 'המיקום חסום לאתר הזה. אפשרו אותו בהגדרות הדפדפן (הסמל ליד הכתובת) ונסו שוב.',
      gpsAsk: 'לחצו על ⌖ כדי להשתמש במיקום שלכם.',
      locateTitle: 'הצג את המיקום שלי',
      backHome: 'חזרה לדף הראשי',
      youAreHere: 'אתם כאן',
      gpsFar: 'אתם כרגע מחוץ לתל אביב — חפשו את הכתובת במקום.',
      searching: 'מחפש…',
      noResults: 'לא נמצא. נסו שם של רחוב.',
      confirmSpot: 'זו הנקודה',
      areaCta: 'כמה גרוע כאן?',
      areaWithin: 'דיווחים ברדיוס 250 מ׳',
      areaCaveat: 'מבוסס על מה שאנשים דיווחו. שקט כאן יכול פשוט להיות מקום שעוד לא דיווחו עליו.',
      areaLocating: 'מאתר אתכם…',
      areaFromCentre: 'לפי מרכז המפה.',
      areaNone: 'אנחנו חדשים, אז עוד לא דיווחו כאן. תנעלו טוב בכל מקרה!',
      areaRank: 'עמוס יותר מ־{p}% מהמקומות במפה.',
      areaRecent: '{n} מהם בשנה האחרונה.',
      areaHow: 'הכי נפוץ כאן: {what}',
      bandNone: 'עוד אין כלום כאן',
      bandQuiet: 'שקט מהממוצע',
      bandAverage: 'בערך ממוצע',
      bandBusy: 'עמוס מהממוצע',
      bandHot: 'מוקד',
      formTitle: 'דיווח על גניבה', pinnedAt: 'סומן ב־', repin: 'הזזת סימון',
      qDate: 'מתי נגנבו?', qTime: 'שעה ביום', qBike: 'סוג האופניים',
      qLock: 'איזה מנעול היה', qParked: 'איפה חנו?',
      qFail: 'מה נשבר?',
      fFail: 'מה נשבר', anyFail: 'הכול',
      lock_cut: 'חתכו את המנעול',
      anchor_cut: 'חתכו את מה שהם היו נעולים אליו',
      anchor_removed: 'עקרו את מה שהם היו נעולים אליו',
      lock_opened: 'המנעול נפתח, לא נשבר',
      not_locked: 'הם לא היו נעולים',
      qNotes: 'משהו נוסף?', optional: '(לא חובה)',
      notesPh: 'למשל: חתכו את העמוד, 20:00–23:00',
      cancel: 'ביטול', submit: 'הוספה למפה',
      privacy: 'בלי חשבון, בלי אימייל, בלי שום פרט מזהה.',
      thanks: 'נוסף. תודה — זה עוזר לכולם.',
      needDate: 'בחרו תאריך גניבה.', needPin: 'סמנו קודם נקודה במפה.',
      offline: 'אין חיבור לשרת. נסו שוב.',
      previewMode: 'מצב תצוגה — הדיווחים עדיין לא נשמרים.',
      previewSave: 'לא נשמר: עדיין אין מסד נתונים מחובר למפה.',
      rateMsg: 'יותר מדי דיווחים בבת אחת. נסו שוב מאוחר יותר.',
      dupMsg: 'כבר דיווחתם על גניבה בנקודה הזו בתאריך הזה.',
      stolen: 'נגנבו', noneYet: 'אין עדיין דיווחים — היו הראשונים.',
      morning: 'בוקר', afternoon: 'צהריים', evening: 'ערב', night: 'לילה', unknown: 'לא בטוח',
      city: 'עירוניים', electric: 'חשמליים', road: 'כביש', mountain: 'הרים', scooter: 'קורקינט', other: 'אחר',
      ulock: 'מנעול U', chain: 'שרשרת', cable: 'כבל', folding: 'מתקפל', none: 'בלי מנעול',
      street: 'עמוד ברחוב', rack: 'מתקן אופניים', building: 'כניסה לבניין', courtyard: 'חצר',
      lockNone: 'ללא מנעול',
    },
  };

  var saved = localStorage.getItem('sbt-lang');
  var lang = saved === 'he' || saved === 'en'
    ? saved
    : ((navigator.language || '').indexOf('he') === 0 ? 'he' : 'en');
  function t(k) { return (STR[lang] && STR[lang][k]) || STR.en[k] || k; }

  // ------------------------------------------------------------------- dom

  var $ = function (s) { return document.querySelector(s); };
  var state = { all: [], shown: [], pin: null, pinLabel: null, draft: {}, marker: null, picking: false };

  // -------------------------------------------------------------------- map

  // Leaflet measures its container once, at construction, and builds the tile
  // grid from that number. Inside a grid shell the container can still be
  // collapsed on the first frame, which leaves the map permanently convinced
  // it is a few hundred pixels tall. So: wait for a real box, then build.
  var mapEl = document.getElementById('map');
  var map;

  function boot(onReady) {
    var tries = 0;
    (function attempt() {
      var box = mapEl.getBoundingClientRect();
      if ((box.height > 80 && box.width > 80) || ++tries > 60) return onReady();
      requestAnimationFrame(attempt);
    })();
  }

  function initMap() {
    map = L.map('map', { zoomControl: true, minZoom: 11, maxZoom: 18 }).setView(TLV, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    pinLayer.addTo(map);
    addLocateControl();
    if (window.ResizeObserver) {
      new ResizeObserver(function () { map.invalidateSize(); }).observe(mapEl);
    }
  }

  var pinLayer = L.layerGroup();
  // Not attached yet: leaflet.heat throws if it draws into a zero-sized canvas,
  // which is what happens on a first paint with no points. render() attaches it
  // once there is something to draw.
  var heatLayer = L.heatLayer([], {
    radius: 26, blur: 20, minOpacity: 0.35,
    gradient: { 0.2: '#e8c46a', 0.45: '#dd8b34', 0.7: '#c2562a', 1.0: '#7e1f10' },
  });

  var pinIcon = L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [13, 13], iconAnchor: [6, 6] });
  var freshIcon = L.divIcon({ className: '', html: '<div class="pin fresh"></div>', iconSize: [13, 13], iconAnchor: [6, 6] });

  // The pin you are placing is a different object from the pins already on the
  // map: bigger, teardrop, obviously something you grab.
  var dropIcon = L.divIcon({
    className: '',
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    html: '<div class="pin-drop"><svg viewBox="0 0 30 40" width="30" height="40">' +
          '<path d="M15 38C15 38 27 23.5 27 14.2 27 7 21.6 1.5 15 1.5S3 7 3 14.2C3 23.5 15 38 15 38z" ' +
          'fill="#a63218" stroke="#f3e4cd" stroke-width="2.5" stroke-linejoin="round"/>' +
          '<circle cx="15" cy="14" r="4.6" fill="#f3e4cd"/></svg></div>',
  });

  // ------------------------------------------------------------------ i18n apply

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    $('#lang').textContent = lang === 'he' ? 'EN' : 'עב';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key === 'qNotes') el.innerHTML = t('qNotes') + ' <em>' + t('optional') + '</em>';
      else el.textContent = t(key);
    });
    if (window.renderByline) renderByline();
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-title'));
      el.title = v;
      el.setAttribute('aria-label', v);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    buildChips();
    buildFilterSelects();
    render();
  }

  $('#lang').addEventListener('click', function () {
    lang = lang === 'he' ? 'en' : 'he';
    localStorage.setItem('sbt-lang', lang);
    applyLang();
  });

  // ---------------------------------------------------------------- chips

  function buildChips() {
    [['#q-time', 'time_of_day'], ['#q-bike', 'bike_type'], ['#q-lock', 'lock_type'],
     ['#q-parked', 'parked_at'], ['#q-fail', 'failure_mode']]
      .forEach(function (pair) {
        var box = $(pair[0]);
        var field = pair[1];
        box.innerHTML = '';
        OPTIONS[field].forEach(function (value) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'chip';
          b.textContent = t(value);
          b.setAttribute('aria-pressed', state.draft[field] === value ? 'true' : 'false');
          b.addEventListener('click', function () {
            state.draft[field] = value;
            Array.prototype.forEach.call(box.children, function (c) { c.setAttribute('aria-pressed', 'false'); });
            b.setAttribute('aria-pressed', 'true');
          });
          box.appendChild(b);
        });
      });
  }

  function buildFilterSelects() {
    fillSelect($('#f-bike'), 'bike_type', 'anyType');
    fillSelect($('#f-lock'), 'lock_type', 'anyLock');
  }

  function fillSelect(sel, field, anyKey) {
    var keep = sel.value || 'all';
    sel.innerHTML = '';
    var any = new Option(t(anyKey), 'all');
    sel.appendChild(any);
    OPTIONS[field].forEach(function (v) { sel.appendChild(new Option(t(v), v)); });
    sel.value = keep;
    if (!sel.value) sel.value = 'all';
  }

  // ----------------------------------------------------------------- data

  function load() {
    Store.list()
      .then(function (rows) { state.all = rows || []; })
      .catch(function () { toast(t('offline'), true); })
      .then(function () {
        render();
        if (Store.mode() === 'preview') toast(t('previewMode'), true);
      });
  }

  // Stored coordinates are snapped to a ~100 m grid, so many reports share a
  // cell and would stack into one dot. Scatter each pin inside its own cell by
  // an offset derived from its id — stable across reloads, and it never claims
  // more precision than the grid actually holds.
  function scatter(id, lat, lng) {
    return [lat + (rand(id * 2) - 0.5) * 0.0009, lng + (rand(id * 2 + 1) - 0.5) * 0.0009];
  }

  function rand(seed) {
    var t = (seed + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function daysAgo(dateStr) {
    return (Date.now() - new Date(dateStr + 'T12:00:00Z').getTime()) / 86400000;
  }

  function filtered() {
    var period = $('#f-period').value;
    var bike = $('#f-bike').value;
    var lock = $('#f-lock').value;
    return state.all.filter(function (x) {
      if (period !== 'all' && daysAgo(x.occurred_on) > Number(period)) return false;
      if (bike !== 'all' && x.bike_type !== bike) return false;
      if (lock !== 'all' && x.lock_type !== lock) return false;
      return true;
    });
  }

  function render() {
    baseline = null;
    state.shown = filtered();

    pinLayer.clearLayers();
    state.shown.forEach(function (x) {
      L.marker(scatter(x.id, x.lat, x.lng), { icon: x.__fresh ? freshIcon : pinIcon })
        .bindPopup(popupHtml(x))
        .addTo(pinLayer);
    });

    $('#stat-total').textContent = state.all.length;
    $('#stat-90').textContent = state.all.filter(function (x) { return daysAgo(x.occurred_on) <= 90; }).length;
    $('#stat-zone').textContent = state.all.length ? t(topKey(state.all, 'time_of_day')) : '—';
    $('#showing-n').textContent = state.shown.length;

    renderBars();
    drawHeat();
  }

  // leaflet.heat throws if it ever draws into a zero-sized canvas. Keep that
  // failure away from everything else on the page.
  function drawHeat() {
    try {
      if ($('#f-heat').checked && state.shown.length) {
        heatLayer.setLatLngs(state.shown.map(function (x) {
          var p = scatter(x.id, x.lat, x.lng);
          return [p[0], p[1], 0.7];
        }));
        if (!map.hasLayer(heatLayer)) heatLayer.addTo(map);
        else heatLayer.redraw();
      } else if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    } catch (e) {
      /* no heat this frame; pins still tell the story */
    }
  }

  function topKey(rows, field) {
    var counts = {};
    rows.forEach(function (r) { counts[r[field]] = (counts[r[field]] || 0) + 1; });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || 'unknown';
  }

  function renderBars() {
    var ul = $('#bars');
    ul.innerHTML = '';
    var counts = {};
    state.shown.forEach(function (r) { counts[r.bike_type] = (counts[r.bike_type] || 0) + 1; });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    if (!keys.length) {
      var li = document.createElement('li');
      li.style.gridTemplateColumns = '1fr';
      li.innerHTML = '<span class="bar-l" style="white-space:normal">' + t('noneYet') + '</span>';
      ul.appendChild(li);
      return;
    }
    var max = counts[keys[0]];
    keys.forEach(function (k) {
      var li = document.createElement('li');
      var pct = Math.round((counts[k] / max) * 100);
      li.innerHTML =
        '<span class="bar-l"></span>' +
        '<span class="bar-t"><span class="bar-f" style="width:' + pct + '%"></span></span>' +
        '<span class="bar-n">' + counts[k] + '</span>';
      li.querySelector('.bar-l').textContent = t(k);
      ul.appendChild(li);
    });
  }

  function popupHtml(x) {
    var d = document.createElement('div');
    var date = document.createElement('div');
    date.className = 'pop-date';
    date.textContent = t('stolen') + ' · ' + fmtDate(x.occurred_on);
    var meta = document.createElement('div');
    meta.className = 'pop-meta';
    meta.textContent = [t(x.bike_type), x.lock_type === 'none' ? t('lockNone') : t(x.lock_type), t(x.parked_at), t(x.time_of_day)].join(' · ');
    d.appendChild(date);
    d.appendChild(meta);
    if (x.failure_mode && x.failure_mode !== 'unknown') {
      var how = document.createElement('div');
      how.className = 'pop-how';
      how.textContent = t(x.failure_mode);
      d.appendChild(how);
    }
    if (x.notes) {
      var n = document.createElement('div');
      n.className = 'pop-notes';
      n.textContent = '“' + x.notes + '”';
      d.appendChild(n);
    }
    return d;
  }

  function fmtDate(s) {
    try {
      return new Date(s + 'T12:00:00Z').toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB',
        { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return s; }
  }

  // ------------------------------------------------------- how bad is here
  //
  // This is deliberately not a safety score. Nobody counts the bikes that were
  // parked and fine, so there is no denominator and no way to say "safe". What
  // the data can honestly answer is: compared with the rest of this map, how
  // much gets reported around this spot, and how recently.

  var RADIUS_KM = 0.25;
  var baseline = null;          // weighted counts at every report, sorted
  var areaCircle = null;

  function kmBetween(aLat, aLng, bLat, bLng) {
    var dLat = (aLat - bLat) * 111;
    var dLng = (aLng - bLng) * 94;      // close enough at this latitude
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  // A theft last month says more about today than one from four years ago.
  function recencyWeight(dateStr) {
    var d = daysAgo(dateStr);
    if (d <= 90) return 1;
    if (d <= 365) return 0.65;
    if (d <= 730) return 0.45;
    return 0.3;
  }

  function nearby(lat, lng) {
    return state.all.filter(function (x) {
      return kmBetween(lat, lng, x.lat, x.lng) <= RADIUS_KM;
    });
  }

  function weightAt(lat, lng) {
    return nearby(lat, lng).reduce(function (sum, x) {
      return sum + recencyWeight(x.occurred_on);
    }, 0);
  }

  // The yardstick is every other place on this map that has reports. Saying
  // "busier than 70% of reported places" is true; "70% safe" would not be.
  function buildBaseline() {
    baseline = state.all.map(function (x) { return weightAt(x.lat, x.lng); })
      .sort(function (a, b) { return a - b; });
  }

  function percentile(value) {
    if (!baseline || !baseline.length) return 0;
    var below = 0;
    for (var i = 0; i < baseline.length && baseline[i] < value; i++) below++;
    return Math.round((below / baseline.length) * 100);
  }

  function bandFor(pct) {
    if (pct >= 85) return ['bandHot', 'hot'];
    if (pct >= 60) return ['bandBusy', 'busy'];
    if (pct >= 25) return ['bandAverage', 'avg'];
    return ['bandQuiet', 'quiet'];
  }

  function fill(key, vars) {
    return t(key).replace(/\{(\w+)\}/g, function (_, k) { return vars[k]; });
  }

  function showArea(lat, lng, note) {
    if (!baseline) buildBaseline();

    var near = nearby(lat, lng);
    var out = $('#area-out');
    out.hidden = false;
    // On a phone the sidebar scrolls, and the result can open below the fold.
    if (out.scrollIntoView) out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    if (areaCircle) map.removeLayer(areaCircle);
    areaCircle = L.circle([lat, lng], {
      radius: RADIUS_KM * 1000,
      color: '#a6301a', weight: 2, opacity: .7,
      fillColor: '#c2562a', fillOpacity: .1,
    }).addTo(map);
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });

    $('#area-n').textContent = near.length;

    var badge = $('#area-band');
    var rank = $('#area-rank');
    var how = $('#area-how');
    $('#area-note').textContent = note || '';

    if (!near.length) {
      badge.textContent = t('bandNone');
      badge.className = 'area-band none';
      rank.textContent = t('areaNone');
      how.textContent = '';
      return;
    }

    var pct = percentile(weightAt(lat, lng));
    var band = bandFor(pct);
    badge.textContent = t(band[0]);
    badge.className = 'area-band ' + band[1];

    var lastYear = near.filter(function (x) { return daysAgo(x.occurred_on) <= 365; }).length;
    rank.textContent = fill('areaRank', { p: pct }) + ' ' + fill('areaRecent', { n: lastYear });

    var modes = {};
    near.forEach(function (x) {
      if (x.failure_mode && x.failure_mode !== 'unknown') {
        modes[x.failure_mode] = (modes[x.failure_mode] || 0) + 1;
      }
    });
    var top = Object.keys(modes).sort(function (a, b) { return modes[b] - modes[a]; })[0];
    how.textContent = top ? fill('areaHow', { what: t(top).toLowerCase() }) : '';
  }

  $('#area-btn').addEventListener('click', function () {
    var out = $('#area-out');
    out.hidden = false;
    $('#area-band').textContent = t('areaLocating');
    $('#area-band').className = 'area-band';
    $('#area-rank').textContent = '';
    $('#area-how').textContent = '';
    $('#area-note').textContent = '';

    var centre = map.getCenter();
    locate(
      function (lat, lng) {
        if (!inBounds(lat, lng)) return showArea(centre.lat, centre.lng, t('areaFromCentre'));
        showArea(lat, lng, null);
      },
      function (msg) {
        showArea(centre.lat, centre.lng, t('areaFromCentre') + ' ' +
                 (msg === t('gpsBlocked') ? msg : t('gpsAsk')));
      },
    );
  });

  $('#area-close').addEventListener('click', function () {
    $('#area-out').hidden = true;
    if (areaCircle) { map.removeLayer(areaCircle); areaCircle = null; }
  });

  // ------------------------------------------------------------ report flow
  //
  // Getting the pin in the right place is the hard part of this form, so it is
  // its own step: locate roughly (GPS or a search), then nudge the pin exactly.

  // Photon does the searching because it tolerates typos, and people typing
  // transliterated Hebrew street names make plenty — "Trumpledor" for
  // Trumpeldor finds nothing at all on an exact-match geocoder. Nominatim
  // stays as a fallback for when Photon is unreachable.
  var PHOTON = 'https://photon.komoot.io/';
  var NOMINATIM = 'https://nominatim.openstreetmap.org/';
  var VIEWBOX = '34.68,32.25,34.95,31.95';   // left,top,right,bottom

  function inBounds(lat, lng) {
    return lat >= 31.95 && lat <= 32.25 && lng >= 34.68 && lng <= 34.95;
  }

  function startPicking() {
    state.picking = true;
    $('#locate').hidden = false;
    $('#map').classList.add('picking');
    $('#sheet').hidden = true;
    hideResults();
    say('locateStart');
    $('#locate-confirm').hidden = !state.pin;
    map.on('click', onMapPick);
  }

  function stopPicking() {
    state.picking = false;
    $('#locate').hidden = true;
    $('#map').classList.remove('picking');
    hideResults();
    map.off('click', onMapPick);
  }

  function onMapPick(e) { placePin(e.latlng, null); }

  function say(key, raw) {
    $('#locate-hint').textContent = raw || t(key);
  }

  // Drops (or moves) the draggable pin and closes in on it.
  function placePin(latlng, label) {
    state.pin = L.latLng(latlng.lat, latlng.lng);

    if (!state.marker) {
      state.marker = L.marker(state.pin, { icon: dropIcon, draggable: true, autoPan: true, zIndexOffset: 1000 }).addTo(map);
      state.marker.on('dragend', function () {
        state.pin = state.marker.getLatLng();
        describePin(null);
      });
    } else {
      state.marker.setLatLng(state.pin);
    }

    map.flyTo(offsetCenter(state.pin, Math.max(map.getZoom(), 17)), Math.max(map.getZoom(), 17), { duration: 0.6 });
    say('locateDrag');
    $('#locate-confirm').hidden = false;
    describePin(label);
  }

  // The locate bar covers the top of the map, so centring on the pin would
  // park it behind the panel. Shift the centre north by half the panel's reach
  // and the pin lands in the middle of the space you can actually see.
  function offsetCenter(latlng, zoom) {
    var bar = $('#locate');
    if (bar.hidden) return latlng;
    var reach = bar.getBoundingClientRect().bottom - $('#map').getBoundingClientRect().top;
    if (!(reach > 0)) return latlng;
    var pt = map.project(latlng, zoom);
    pt.y -= reach / 2;
    return map.unproject(pt, zoom);
  }

  // What to call this spot: whatever the search said, else ask what street it is.
  var describeTimer;
  function describePin(label) {
    var el = $('#addr-label');
    if (label) {
      state.pinLabel = label;
      el.textContent = label;
      return;
    }
    state.pinLabel = null;
    el.textContent = fmtLatLng(state.pin);
    clearTimeout(describeTimer);
    var at = state.pin;
    describeTimer = setTimeout(function () {
      reverseLookup(at.lat, at.lng)
        .then(function (name) {
          if (!state.pin || state.pin.lat !== at.lat) return;   // moved on
          if (name) { state.pinLabel = name; el.textContent = name; }
        })
        .catch(function () { /* coordinates will do */ });
    }, 700);
  }

  function okJson(r) {
    if (!r.ok) throw new Error('geocoder ' + r.status);
    return r.json();
  }

  // Photon speaks en/de/fr/it; "default" gives the local name, Hebrew here.
  function photonLang() {
    return lang === 'he' ? 'default' : 'en';
  }

  // "Trumpeldor 17, Lev Tel Aviv" out of whatever fields came back.
  function placeLabel(p) {
    var street = p.street || p.name;
    var head = [street, p.housenumber].filter(Boolean).join(' ');
    var area = p.district || p.city || p.county;
    return [head, area === head ? null : area].filter(Boolean).join(', ');
  }

  function reverseLookup(lat, lng) {
    return fetch(PHOTON + 'reverse?lang=' + photonLang() + '&lat=' + lat + '&lon=' + lng)
      .then(okJson)
      .then(function (d) {
        var f = (d.features || [])[0];
        return f ? placeLabel(f.properties) : '';
      })
      .catch(function () {
        return fetch(NOMINATIM + 'reverse?format=jsonv2&zoom=18&accept-language=' + lang +
                     '&lat=' + lat + '&lon=' + lng)
          .then(okJson)
          .then(function (d) {
            var a = (d && d.address) || {};
            return placeLabel({
              street: a.road || a.pedestrian || a.footway,
              name: d && d.name,
              housenumber: a.house_number,
              district: a.suburb || a.neighbourhood || a.quarter,
              city: a.city || a.town,
            });
          });
      });
  }

  // ---- address search ------------------------------------------------------

  var searchTimer;
  $('#addr').addEventListener('input', function () {
    var q = this.value.trim();
    clearTimeout(searchTimer);
    if (q.length < 3) return hideResults();
    searchTimer = setTimeout(function () { runSearch(q); }, 450);
  });

  $('#addr').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); clearTimeout(searchTimer); runSearch(this.value.trim()); }
  });

  function runSearch(q) {
    if (q.length < 3) return;
    say(null, t('searching'));
    searchPlaces(q)
      .then(function (hits) {
        if (!hits.length) { hideResults(); return say(null, t('noResults')); }
        showResults(hits);
        say('locateStart');
      })
      .catch(function () { hideResults(); say(null, t('offline')); });
  }

  function searchPlaces(q) {
    var c = map.getCenter();
    return fetch(PHOTON + 'api/?limit=20&lang=' + photonLang() +
                 '&lat=' + c.lat.toFixed(4) + '&lon=' + c.lng.toFixed(4) +
                 '&q=' + encodeURIComponent(q))
      .then(okJson)
      .then(function (d) {
        return (d.features || []).map(function (f) {
          return {
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            label: placeLabel(f.properties),
          };
        });
      })
      .catch(function () { return searchNominatim(q); })
      .then(function (list) {
        return dedupe(list.filter(function (r) { return r.label && inBounds(r.lat, r.lng); }));
      });
  }

  function searchNominatim(q) {
    return fetch(NOMINATIM + 'search?format=jsonv2&addressdetails=1&limit=20&bounded=1' +
                 '&viewbox=' + VIEWBOX + '&accept-language=' + lang +
                 '&q=' + encodeURIComponent(q))
      .then(okJson)
      .then(function (list) {
        return (list || []).map(function (r) {
          var a = r.address || {};
          return {
            lat: +r.lat,
            lng: +r.lon,
            label: placeLabel({
              street: a.road || a.pedestrian || a.footway,
              name: r.name,
              housenumber: a.house_number,
              district: a.suburb || a.neighbourhood || a.quarter,
              city: a.city || a.town,
            }),
          };
        });
      });
  }

  // A long street arrives as one result per segment, all reading the same.
  // Keep the first of each distinct label — the pin gets nudged afterwards.
  function dedupe(list) {
    var seen = {};
    var out = [];
    list.forEach(function (h) {
      var k = h.label.toLowerCase();
      if (seen[k]) return;
      seen[k] = true;
      out.push(h);
    });
    return out.slice(0, 6);
  }

  function showResults(hits) {
    var ul = $('#addr-results');
    ul.innerHTML = '';
    hits.forEach(function (h) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = h.label;
      b.addEventListener('click', function () {
        hideResults();
        $('#addr').value = '';
        placePin({ lat: h.lat, lng: h.lng }, h.label);
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    ul.hidden = false;
  }


  function hideResults() {
    var ul = $('#addr-results');
    ul.hidden = true;
    ul.innerHTML = '';
  }

  // ---- my location ---------------------------------------------------------

  // Once someone denies location the page can never ask again — only their
  // browser settings can undo it. So find out which case we are in and say the
  // thing that actually helps.
  function geoState() {
    if (!navigator.permissions || !navigator.permissions.query) return Promise.resolve('unknown');
    return navigator.permissions.query({ name: 'geolocation' })
      .then(function (p) { return p.state; })
      .catch(function () { return 'unknown'; });
  }

  function locate(onFound, onFail) {
    if (!navigator.geolocation) return onFail(t('gpsDenied'));
    navigator.geolocation.getCurrentPosition(
      function (pos) { onFound(pos.coords.latitude, pos.coords.longitude); },
      function () {
        geoState().then(function (state) {
          onFail(state === 'denied' ? t('gpsBlocked') : t('gpsDenied'));
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }

  function useGps() {
    say(null, t('locating'));
    locate(
      function (lat, lng) {
        if (!inBounds(lat, lng)) return say(null, t('gpsFar'));
        placePin({ lat: lat, lng: lng }, null);
      },
      function (msg) { say(null, msg); },
    );
  }

  // The crosshair control on the map itself.
  var hereMarker = null;
  var hereIcon = L.divIcon({
    className: '', iconSize: [18, 18], iconAnchor: [9, 9],
    html: '<div class="here"></div>',
  });

  function showMe() {
    locate(
      function (lat, lng) {
        if (hereMarker) map.removeLayer(hereMarker);
        hereMarker = L.marker([lat, lng], { icon: hereIcon, zIndexOffset: 500 })
          .bindTooltip(t('youAreHere')).addTo(map);
        map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
      },
      function (msg) { toast(msg, true); },
    );
  }

  function addLocateControl() {
    var Ctl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        var wrap = L.DomUtil.create('div', 'leaflet-bar locate-ctl');
        var a = L.DomUtil.create('a', '', wrap);
        a.href = '#';
        a.title = t('locateTitle');
        a.setAttribute('aria-label', t('locateTitle'));
        a.innerHTML = '<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true">' +
          '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
          '<circle cx="9" cy="9" r="3.4"/><path d="M9 1v2.4M9 14.6V17M1 9h2.4M14.6 9H17"/></g></svg>';
        L.DomEvent.on(a, 'click', L.DomEvent.stop);
        L.DomEvent.on(a, 'click', showMe);
        return wrap;
      },
    });
    map.addControl(new Ctl());
  }

  $('#use-gps').addEventListener('click', useGps);
  $('#locate-cancel').addEventListener('click', cancelPicking);
  $('#confirm-spot').addEventListener('click', function () {
    stopPicking();
    openSheet();
  });

  function cancelPicking() {
    stopPicking();
    if (state.marker) { map.removeLayer(state.marker); state.marker = null; }
    state.pin = null;
    state.pinLabel = null;
  }

  // ---- the details sheet ---------------------------------------------------

  function fmtLatLng(p) { return p.lat.toFixed(5) + ', ' + p.lng.toFixed(5); }

  function openSheet() {
    $('#pin-label').textContent = state.pinLabel || (state.pin ? fmtLatLng(state.pin) : '—');
    $('#form-error').hidden = true;
    $('#sheet').hidden = false;
    if (!$('#q-date').value) $('#q-date').value = new Date().toISOString().slice(0, 10);
    $('#q-date').max = new Date().toISOString().slice(0, 10);
  }

  function closeSheet() {
    $('#sheet').hidden = true;
  }

  $('#report-btn').addEventListener('click', function () {
    state.draft = {};
    state.pin = null;
    state.pinLabel = null;
    if (state.marker) { map.removeLayer(state.marker); state.marker = null; }
    $('#q-notes').value = '';
    $('#addr').value = '';
    buildChips();
    startPicking();
    useGps();          // ask straight away; the fallbacks are right there
  });

  $('#sheet-close').addEventListener('click', closeSheet);
  $('#sheet-cancel').addEventListener('click', closeSheet);
  $('#repin').addEventListener('click', function () { closeSheet(); startPicking(); });
  $('#sheet').addEventListener('click', function (e) { if (e.target === $('#sheet')) closeSheet(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#sheet').hidden) closeSheet();
    else if (state.picking) cancelPicking();
  });

  ['#f-period', '#f-bike', '#f-lock', '#f-heat'].forEach(function (s) {
    $(s).addEventListener('change', render);
  });

  var filtersOpen = false;
  $('#filters-toggle').addEventListener('click', function () {
    filtersOpen = !filtersOpen;
    $('#filters-panel').hidden = !filtersOpen;
    this.setAttribute('aria-expanded', String(filtersOpen));
  });

  $('#report-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#form-error');
    err.hidden = true;

    // Only the two facts that make a pin worth anything are required. The rest
    // is detail — asking for it is fine, demanding it just loses reports.
    if (!state.pin) return showErr(t('needPin'));
    if (!$('#q-date').value) return showErr(t('needDate'));

    var body = {
      lat: state.pin.lat, lng: state.pin.lng,
      occurred_on: $('#q-date').value,
      notes: $('#q-notes').value,
      website: $('#q-website').value,   // honeypot; a person never fills this
      time_of_day: state.draft.time_of_day || 'unknown',
      bike_type: state.draft.bike_type || 'unknown',
      lock_type: state.draft.lock_type || 'unknown',
      parked_at: state.draft.parked_at || 'unknown',
      failure_mode: state.draft.failure_mode || 'unknown',
    };

    var btn = $('#submit-btn');
    btn.disabled = true;

    Store.add(body)
      .then(function (saved) {
        btn.disabled = false;
        if (state.marker) { map.removeLayer(state.marker); state.marker = null; }
        saved.__fresh = true;
        state.all.unshift(saved);
        closeSheet();
        render();
        toast(t('thanks'));
        getaway();
      })
      .catch(function (e) {
        btn.disabled = false;
        showErr(errorText(e));
      });

    function showErr(m) {
      err.textContent = m;
      err.hidden = false;
      return false;
    }
  });

  function errorText(e) {
    switch (e && e.message) {
      case 'PREVIEW': return t('previewSave');
      case 'RATE': return t('rateMsg');
      case 'DUPLICATE': return t('dupMsg');
      case 'BBOX': return t('needPin');
      case 'DATE': return t('needDate');
      case 'SAVE': return t('offline');
      default: return (e && e.message) || t('offline');
    }
  }

  // A small reward for reporting: the culprit makes off across the map.
  var thiefTimer;
  function getaway() {
    var stage = $('#thief-stage');
    stage.innerHTML = '<div class="thief">' + (window.THIEF_SVG || '') + '</div>';
    clearTimeout(thiefTimer);
    thiefTimer = setTimeout(function () { stage.innerHTML = ''; }, 2900);
  }

  var toastTimer;
  function toast(msg, bad) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (bad ? ' bad' : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
  }

  boot(function () {
    initMap();
    applyLang();
    load();
    // Arriving from the landing page's report button.
    if (location.hash === '#report') {
      history.replaceState(null, '', location.pathname + location.search);
      $('#report-btn').click();
    }
  });
})();
