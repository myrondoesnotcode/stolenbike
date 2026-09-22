/* Ink drawings for the landing page.
 *
 * They are deliberately plain paths — the hand-drawn wobble comes from the
 * #rough SVG filter in the page, which displaces every stroke with a little
 * turbulence. One filter, applied to everything, keeps the whole page looking
 * like it came from the same pen.
 */
window.DOODLES = (function () {
  var open = '<svg class="ink" xmlns="http://www.w3.org/2000/svg" fill="none" ' +
             'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ';

  return {

    // The hero: a bike that is now mostly a memory.
    bike:
      open + 'viewBox="0 0 250 150" stroke-width="3.2">' +
        '<g>' +
          '<circle cx="60" cy="98" r="33"/>' +
          '<circle cx="60" cy="98" r="4.5"/>' +
          '<path d="M60 65v66M27 98h66M37 75l46 46M83 75L37 121" stroke-width="1.4" opacity=".55"/>' +
          '<path d="M60 98h50l-17-45h58"/>' +
          '<path d="M110 98l41-45M151 53l16 20"/>' +
          '<path d="M60 98l33-45M86 51h16"/>' +
          '<path d="M110 98l-9 9M110 98l9-9" stroke-width="2.6"/>' +
          '<path d="M151 50l11-9M162 41l9 3" stroke-width="2.6"/>' +
        '</g>' +
        // the fork, ending in nothing at all
        '<path d="M167 73l12 27" stroke-dasharray="1 0"/>' +
        '<path d="M172 104a8 8 0 0 0 14 0" stroke-width="2" opacity=".5"/>' +
        // the cable that did not hold
        '<path d="M120 127c-14-9-30-3-31 6 0 7 9 10 15 6 7-5 2-16-9-16" stroke-width="2.6"/>' +
        '<path d="M120 127l7-3M120 127l6 4M95 139l-4 4M95 139l1 5" stroke-width="2"/>' +
        // ground
        '<path d="M18 138h40M74 138h26M140 138h48M200 138h30" stroke-width="2" opacity=".35"/>' +
      '</svg>',

    pin:
      open + 'viewBox="0 0 28 34" stroke-width="2.4">' +
        '<path d="M10 4h8M14 4v9M14 13c-6 2-9 6-9 8h18c0-2-3-6-9-8z"/>' +
        '<path d="M14 21v10"/>' +
      '</svg>',

    arrow:
      open + 'viewBox="0 0 80 46" stroke-width="2.6">' +
        '<path d="M4 8c22 2 44 12 66 28"/>' +
        '<path d="M60 38l10-2-3-10"/>' +
      '</svg>',

    // One per lock type, each already defeated.
    locks: {
      cable:
        open + 'viewBox="0 0 70 60" stroke-width="3">' +
          '<path d="M12 44c-8-10-4-26 10-30 13-4 24 4 26 14"/>' +
          '<path d="M52 34c2 10-6 18-16 18" stroke-dasharray="4 7"/>' +
          '<path d="M45 26l10-6M45 26l9 7" stroke-width="2.4"/>' +
          '<path d="M14 46l-8 5M14 46l-2 9" stroke-width="2.4"/>' +
        '</svg>',
      chain:
        open + 'viewBox="0 0 70 60" stroke-width="2.8">' +
          '<ellipse cx="14" cy="30" rx="8" ry="11"/>' +
          '<ellipse cx="30" cy="30" rx="8" ry="11"/>' +
          '<path d="M40 22c5 2 7 5 7 8"/>' +
          '<path d="M54 22c-4 2-6 5-6 8 0 4 3 8 8 9"/>' +
          '<path d="M44 14l6 8M44 30l7-6" stroke-width="2.2"/>' +
        '</svg>',
      ulock:
        open + 'viewBox="0 0 70 60" stroke-width="3">' +
          '<path d="M20 34V22a15 15 0 0 1 24-3"/>' +
          '<path d="M48 26v8" stroke-dasharray="3 6"/>' +
          '<rect x="13" y="34" width="42" height="20" rx="4"/>' +
          '<path d="M34 41v6" stroke-width="2.4"/>' +
          '<path d="M44 16l8-6M46 22l9-3" stroke-width="2.2"/>' +
        '</svg>',
      folding:
        open + 'viewBox="0 0 70 60" stroke-width="3">' +
          '<path d="M10 42l14-18 12 16 12-16 10 12"/>' +
          '<circle cx="24" cy="24" r="2.4"/><circle cx="36" cy="40" r="2.4"/><circle cx="48" cy="24" r="2.4"/>' +
          '<path d="M56 38l6 8M62 38l-6 8" stroke-width="2.4"/>' +
        '</svg>',
      none:
        open + 'viewBox="0 0 70 60" stroke-width="3">' +
          '<path d="M35 10v38M27 50h16"/>' +
          '<path d="M18 26c-3 4-4 8-3 11M52 26c3 4 4 8 3 11" stroke-width="2" opacity=".5"/>' +
          '<path d="M46 16l8-5M50 22l8-2" stroke-width="2.2" opacity=".6"/>' +
        '</svg>',
      unknown:
        open + 'viewBox="0 0 70 60" stroke-width="3">' +
          '<path d="M25 22a11 11 0 0 1 21 4c0 8-10 8-10 15"/>' +
          '<path d="M36 48v.5"/>' +
        '</svg>',
    },
  };
})();
