/* The landing page. Reads the same data the map does, so the numbers on the
   front door are the real ones — or the demo ones, clearly labelled. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };

  // ---------------------------------------------------------------- i18n

  var STR = {
    en: {
      stamp: 'STOLEN',
      h1: 'Someone took your bike.',
      lede: "and they took my friend's, and hers, and his",
      body: 'Put a pin where it happened. Enough pins and we can all finally see ' +
            'which corners in this city to stop trusting.',
      ctaMap: 'Open the map', ctaReport: 'Report mine', ctaMap2: 'Open the map',
      noteCta: 'takes 30 seconds, no account',
      cTotal: 'bikes on the map', c90: 'gone in the last 90 days', cHour: 'when it usually happens',
      previewNote: 'No database connected yet — reports will not save.',
      boardTitle: 'The league table nobody wants to win',
      boardSub: 'counted by hand, more or less',
      boardNote: 'Every pin is blurred to a ~100 m square, so treat this as a neighbourhood, not an address.',
      lockTitle: 'What they cut through',
      lockSub: 'the lock that was on it, at the time',
      howTitle: 'How to add yours',
      s1h: 'Say where',
      s1p: 'Let it find you, search the street, or just tap the map. Then drag the pin onto the exact pole.',
      s2h: 'Say what',
      s2p: 'When, what kind of bike, which lock, where it was parked. Five taps.',
      s3h: "That's it",
      s3p: 'Your pin joins the heat map and the picture gets a little clearer for everyone else.',
      closerH: 'This will not get your bike back.',
      closerP: 'Nothing will. What it can do is warn the next person that the rack ' +
               'outside that café has eaten four bikes this year.',
      footNote: 'Crowdsourced and unverified. Pins are approximate and deliberately blurred — never mark your own front door.',
      empty: 'nothing here yet — the table starts with your pin',
      emptyLocks: 'nothing yet. the first report starts this wall.',
      morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night', unknown: 'Unknown',
      lock_ulock: 'U-lock', lock_chain: 'Chain', lock_cable: 'Cable lock',
      lock_folding: 'Folding lock', lock_none: 'No lock at all', lock_unknown: 'Not sure',
      quip_ulock: 'the good one. still not a promise',
      quip_chain: 'heavy to carry, quick to cut',
      quip_cable: 'a shoelace with ambitions',
      quip_folding: 'clever engineering, brief career',
      quip_none: 'a leap of faith, punished',
      quip_unknown: 'it was a blur. understandable',
    },
    he: {
      stamp: 'נגנבו',
      h1: 'מישהו לקח לכם את האופניים.',
      lede: 'וגם של חבר שלי, וגם שלה, וגם שלו',
      body: 'סמנו איפה זה קרה. מספיק סימונים, וכולנו סוף סוף נראה באילו פינות בעיר ' +
            'כדאי להפסיק לבטוח.',
      ctaMap: 'למפה', ctaReport: 'לדווח על שלי', ctaMap2: 'למפה',
      noteCta: 'שלושים שניות, בלי חשבון',
      cTotal: 'אופניים על המפה', c90: 'נעלמו ב־90 הימים האחרונים', cHour: 'מתי זה בדרך כלל קורה',
      previewNote: 'עדיין אין מסד נתונים מחובר — דיווחים לא יישמרו.',
      boardTitle: 'הטבלה שאף אחד לא רוצה להוביל',
      boardSub: 'נספר ביד, פחות או יותר',
      boardNote: 'כל סימון מטושטש לריבוע של כ־100 מטר, אז זו שכונה — לא כתובת.',
      lockTitle: 'מה הם חתכו',
      lockSub: 'המנעול שהיה עליהם, באותו רגע',
      howTitle: 'איך מוסיפים',
      s1h: 'איפה',
      s1p: 'תנו לאתר אתכם, חפשו את הרחוב, או פשוט לחצו על המפה. ואז גררו את הסימון לעמוד המדויק.',
      s2h: 'מה',
      s2p: 'מתי, איזה אופניים, איזה מנעול, איפה הם חנו. חמש לחיצות.',
      s3h: 'וזהו',
      s3p: 'הסימון מצטרף למפת החום, והתמונה מתבהרת קצת לכל השאר.',
      closerH: 'זה לא יחזיר לכם את האופניים.',
      closerP: 'שום דבר לא יחזיר. מה שזה כן עושה: מזהיר את הבא בתור שהמתקן ליד ' +
               'בית הקפה ההוא בלע השנה ארבעה זוגות.',
      footNote: 'מידע מהקהילה, לא מאומת. הסימונים משוערים ומטושטשים בכוונה — אל תסמנו את הבית שלכם.',
      empty: 'עדיין ריק — הטבלה מתחילה מהסימון שלכם',
      emptyLocks: 'עדיין ריק. הדיווח הראשון פותח את הקיר הזה.',
      morning: 'בוקר', afternoon: 'צהריים', evening: 'ערב', night: 'לילה', unknown: 'לא ידוע',
      lock_ulock: 'מנעול U', lock_chain: 'שרשרת', lock_cable: 'מנעול כבל',
      lock_folding: 'מנעול מתקפל', lock_none: 'בלי מנעול בכלל', lock_unknown: 'לא בטוח',
      quip_ulock: 'הטוב שבחבורה. עדיין לא הבטחה',
      quip_chain: 'כבד לסחוב, מהיר לחתוך',
      quip_cable: 'שרוך נעל עם שאיפות',
      quip_folding: 'הנדסה חכמה, קריירה קצרה',
      quip_none: 'הימור על האנושות. הפסדתם',
      quip_unknown: 'הכול היה מטושטש. מובן',
    },
  };

  var saved = localStorage.getItem('sbt-lang');
  var lang = saved === 'he' || saved === 'en'
    ? saved
    : ((navigator.language || '').indexOf('he') === 0 ? 'he' : 'en');

  function t(k) { return (STR[lang] && STR[lang][k]) || STR.en[k] || k; }

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    $('#lang').textContent = lang === 'he' ? 'EN' : 'עב';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    if (window.renderByline) renderByline();
    if (rows) paint(rows);
  }

  $('#lang').addEventListener('click', function () {
    lang = lang === 'he' ? 'en' : 'he';
    localStorage.setItem('sbt-lang', lang);
    applyLang();
  });

  // --------------------------------------------------- neighbourhoods
  //
  // Nothing in a report says which neighbourhood it happened in, so each pin
  // goes to the nearest of these centres — and only if it is within ~1.3 km,
  // otherwise it sits outside the table rather than being forced into it.

  var HOODS = [
    { en: 'Florentin',          he: 'פלורנטין',        lat: 32.0553, lng: 34.7679 },
    { en: 'Neve Tzedek',        he: 'נווה צדק',        lat: 32.0620, lng: 34.7620 },
    { en: 'Kerem HaTeimanim',   he: 'כרם התימנים',     lat: 32.0700, lng: 34.7660 },
    { en: 'Rothschild / Lev',   he: 'רוטשילד / לב',    lat: 32.0655, lng: 34.7745 },
    { en: 'Levinsky',           he: 'לוינסקי',         lat: 32.0575, lng: 34.7780 },
    { en: 'City Center',        he: 'מרכז העיר',       lat: 32.0770, lng: 34.7745 },
    { en: 'Old North',          he: 'הצפון הישן',      lat: 32.0880, lng: 34.7760 },
    { en: 'Port / Namal',       he: 'הנמל',            lat: 32.0975, lng: 34.7745 },
    { en: 'Sarona / Azrieli',   he: 'שרונה / עזריאלי', lat: 32.0715, lng: 34.7885 },
    { en: 'Montefiore',         he: 'מונטיפיורי',      lat: 32.0660, lng: 34.7870 },
    { en: 'Bavli',              he: 'בבלי',            lat: 32.0930, lng: 34.7930 },
    { en: 'Ramat Aviv',         he: 'רמת אביב',        lat: 32.1133, lng: 34.8045 },
    { en: 'Ramat HaChayal',     he: 'רמת החייל',       lat: 32.1120, lng: 34.8420 },
    { en: 'Yad Eliyahu',        he: 'יד אליהו',        lat: 32.0510, lng: 34.7930 },
    { en: 'Jaffa',              he: 'יפו',             lat: 32.0510, lng: 34.7540 },
  ];

  var MAX_KM = 1.3;

  function km(aLat, aLng, bLat, bLng) {
    var dLat = (aLat - bLat) * 111;
    var dLng = (aLng - bLng) * 94;      // good enough at this latitude
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  function nearestHood(r) {
    var best = null;
    var bestD = Infinity;
    HOODS.forEach(function (h) {
      var d = km(r.lat, r.lng, h.lat, h.lng);
      if (d < bestD) { bestD = d; best = h; }
    });
    return bestD <= MAX_KM ? best : null;
  }

  // ------------------------------------------------------------ painting

  var rows = null;
  var LOCKS = ['none', 'cable', 'chain', 'ulock', 'folding', 'unknown'];

  function daysAgo(d) {
    return (Date.now() - new Date(d + 'T12:00:00Z').getTime()) / 86400000;
  }

  function countUp(el, target) {
    if (target <= 0) { el.textContent = '0'; return; }
    var start = performance.now();
    var dur = Math.min(900, 240 + target * 7);
    (function step(now) {
      var k = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(start);
  }

  function paint(list) {
    rows = list;

    countUp($('#c-total'), list.length);
    countUp($('#c-90'), list.filter(function (r) { return daysAgo(r.occurred_on) <= 90; }).length);

    var hours = tally(list, 'time_of_day');
    var topHour = rank(hours)[0];
    $('#c-hour').textContent = topHour ? t(topHour[0]) : '—';

    // league table
    var counts = {};
    list.forEach(function (r) {
      var h = nearestHood(r);
      if (h) counts[h.en] = (counts[h.en] || 0) + 1;
    });
    var ordered = rank(counts).slice(0, 6);
    var ol = $('#hoods');
    ol.innerHTML = '';
    if (!ordered.length) {
      var li = document.createElement('li');
      li.style.gridTemplateColumns = '1fr';
      var span = document.createElement('span');
      span.className = 'empty';
      span.textContent = t('empty');
      li.appendChild(span);
      ol.appendChild(li);
    } else {
      ordered.forEach(function (pair) {
        var hood = HOODS.filter(function (h) { return h.en === pair[0]; })[0];
        var li = document.createElement('li');

        var name = document.createElement('div');
        name.className = 'hood-name';
        name.textContent = lang === 'he' ? hood.he : hood.en;

        var tally = document.createElement('div');
        tally.className = 'hood-tally';
        tally.innerHTML = tallyMarks(pair[1]);

        var n = document.createElement('div');
        n.className = 'hood-n';
        n.textContent = pair[1];

        li.appendChild(name);
        li.appendChild(tally);
        li.appendChild(n);
        ol.appendChild(li);
      });
    }

    // locks
    var lockCounts = tally(list, 'lock_type');
    var ul = $('#locks');
    ul.innerHTML = '';

    if (!list.length) {
      var none = document.createElement('li');
      none.className = 'lock-empty';
      none.textContent = t('emptyLocks');
      ul.appendChild(none);
      return;
    }

    LOCKS.filter(function (k) { return lockCounts[k]; })
      .sort(function (a, b) { return lockCounts[b] - lockCounts[a]; })
      .forEach(function (k) {
        var li = document.createElement('li');

        var art = document.createElement('div');
        art.className = 'lock-art';
        art.innerHTML = (window.DOODLES && DOODLES.locks[k]) || '';
        li.appendChild(art);

        var n = document.createElement('div');
        n.className = 'lock-n';
        n.textContent = lockCounts[k];
        var name = document.createElement('p');
        name.className = 'lock-name';
        name.textContent = t('lock_' + k);
        var quip = document.createElement('p');
        quip.className = 'lock-quip';
        quip.textContent = t('quip_' + k);
        li.appendChild(n);
        li.appendChild(name);
        li.appendChild(quip);
        ul.appendChild(li);
      });
  }

  // Five strokes to a gate, the fourth crossed by the fifth. Beyond five
  // gates the marks stop being readable, so the numeral carries it from there.
  function tallyMarks(n) {
    var gates = Math.min(Math.floor(n / 5), 5);
    var rest = gates === 5 ? 0 : n % 5;
    var w = gates * 27 + rest * 6 + 4;
    var out = '<svg class="ink" viewBox="0 0 ' + w + ' 22" height="22" width="' + w + '" ' +
              'fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round">';
    var x = 3;
    for (var g = 0; g < gates; g++) {
      for (var i = 0; i < 4; i++) out += '<path d="M' + (x + i * 5) + ' 3v16"/>';
      out += '<path d="M' + (x - 2) + ' 18L' + (x + 19) + ' 4"/>';
      x += 27;
    }
    for (var r = 0; r < rest; r++) out += '<path d="M' + (x + r * 6) + ' 3v16"/>';
    return out + '</svg>';
  }

  function tally(list, field) {
    var out = {};
    list.forEach(function (r) { out[r[field]] = (out[r[field]] || 0) + 1; });
    return out;
  }

  function rank(counts) {
    return Object.keys(counts)
      .map(function (k) { return [k, counts[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
  }

  // ------------------------------------------------------------------ go

  if (window.DOODLES) {
    document.getElementById('art-bike').innerHTML = DOODLES.bike;
    document.getElementById('art-arrow').innerHTML = DOODLES.arrow;
    document.querySelectorAll('.pushpin').forEach(function (el) { el.innerHTML = DOODLES.pin; });
  }

  applyLang();

  Store.list()
    .then(function (list) { paint(list || []); })
    .catch(function () { paint([]); })
    .then(function () {
      if (Store.mode() === 'preview') $('#preview-note').hidden = false;
    });
})();
