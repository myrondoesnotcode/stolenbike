/* "Made by ..." in both footers, and getting that link into the LinkedIn app
 * on a phone rather than a browser tab.
 *
 * There is no single URL that does this everywhere, so the route depends on
 * where the tap comes from:
 *
 *   Desktop            plain https, new tab.
 *   Android            an intent: URL naming the LinkedIn package, with the
 *                      https address as browser_fallback_url. Opens the app if
 *                      installed, the site if not, and never errors.
 *   iOS, real browser  plain https. That is a Universal Link — iOS hands it to
 *                      the app itself when it is installed. Firing a custom
 *                      scheme here would only risk an error dialog for people
 *                      who don't have the app.
 *   iOS, in-app        Universal Links usually do NOT fire inside Instagram's
 *   browser            or Facebook's web view, which is exactly where story
 *                      traffic comes from. So there we try linkedin:// and fall
 *                      back to https if the page is still open a moment later.
 */
window.renderByline = (function () {
  'use strict';

  var IN_APP = /(Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|Snapchat|Pinterest)/i;

  function handleFrom(url) {
    var m = /^https?:\/\/(?:[\w-]+\.)*linkedin\.com\/in\/([^/?#]+)/i.exec(url || '');
    return m ? m[1] : null;
  }

  // Pure, so it can be checked against any user-agent string without a device.
  function routeFor(ua, url) {
    var handle = handleFrom(url);
    if (!handle) return { mode: 'web', href: url };

    if (/Android/i.test(ua)) {
      return {
        mode: 'intent',
        href: 'intent://www.linkedin.com/in/' + handle +
              '/#Intent;scheme=https;package=com.linkedin.android;S.browser_fallback_url=' +
              encodeURIComponent(url) + ';end',
      };
    }

    if (/iPhone|iPad|iPod/i.test(ua)) {
      if (IN_APP.test(ua)) return { mode: 'scheme', href: 'linkedin://in/' + handle, web: url };
      return { mode: 'universal', href: url };
    }

    return { mode: 'web', href: url };
  }

  function render() {
    var cfg = window.BIKEMAP_CONFIG || {};
    var name = cfg.authorName || '';
    var el = document.getElementById('byline');
    if (!name || !el) return;

    el.textContent = '';
    el.appendChild(document.createTextNode(
      document.documentElement.lang === 'he' ? 'נבנה על ידי ' : 'Made by '));

    if (!cfg.authorUrl) {
      el.appendChild(document.createTextNode(name));
      return;
    }

    var route = routeFor(navigator.userAgent || '', cfg.authorUrl);

    var a = document.createElement('a');
    a.textContent = name;
    // The href stays the real web address in every case, so the link still
    // works when copied, and a long-press still shows something sensible.
    a.href = cfg.authorUrl;
    a.rel = 'noopener noreferrer';
    if (route.mode === 'web' || route.mode === 'universal') a.target = '_blank';

    if (route.mode === 'intent') {
      a.href = route.href;
    } else if (route.mode === 'scheme') {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var fallback = setTimeout(function () { window.location.href = route.web; }, 900);
        // Backgrounded means the app took it; cancel the browser fallback.
        document.addEventListener('visibilitychange', function once() {
          if (document.hidden) clearTimeout(fallback);
          document.removeEventListener('visibilitychange', once);
        });
        window.location.href = route.href;
      });
    }

    el.appendChild(a);
  }

  render.routeFor = routeFor;      // exposed so the routing can be tested
  return render;
})();

window.renderByline();
