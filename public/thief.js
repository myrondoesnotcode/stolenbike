/* The culprit. Shared by the landing page (where he loops) and the map
   (where he bolts across once after you file a report). */
window.THIEF_SVG =
  '<svg class="thief-svg" viewBox="0 0 150 92" width="132" height="81" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<g class="dust" stroke="#8f7658" stroke-width="3" stroke-linecap="round" opacity=".5">' +
      '<path d="M6 58h9M2 68h13M10 78h8"/></g>' +
    '<g stroke="#2e1c10" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<g class="wheel"><circle cx="32" cy="66" r="17"/>' +
        '<path d="M32 49v34M15 66h34M20 54l24 24M44 54L20 78" stroke-width="1.6"/></g>' +
      '<g class="wheel"><circle cx="106" cy="66" r="17"/>' +
        '<path d="M106 49v34M89 66h34M94 54l24 24M118 54L94 78" stroke-width="1.6"/></g>' +
      '<path d="M32 66h30l-11-23h37M62 66l26-23M88 43l18 23M32 66l19-23M88 41l7-6"/></g>' +
    '<g class="rider">' +
      '<g stroke="#2e1c10" stroke-width="2.6" stroke-linecap="round" opacity=".9">' +
        '<circle cx="58" cy="22" r="9.5"/><path d="M62 30l6 4" stroke-width="3"/></g>' +
      '<path d="M56 44l20-17" stroke="#a63218" stroke-width="11" stroke-linecap="round"/>' +
      '<path d="M60 41l4 3M67 35l4 3" stroke="#f3e4cd" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M76 27l16 9M56 44l2 13 6 10" stroke="#2e1c10" stroke-width="4.5" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="84" cy="19" r="8.5" fill="#2e1c10"/>' +
      '<path d="M75 17a9 9 0 0 1 18 0z" fill="#2e1c10"/>' +
      '<path d="M77 17h15" stroke="#f3e4cd" stroke-width="4.5" stroke-linecap="round"/>' +
    '</g></svg>';
