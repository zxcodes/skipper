(() => {
  'use strict';

  const LOG = '[Skipper]';

  // Any element whose data-testid mentions "skip": skip-intro-button,
  // skip-ending-button, skip-outro-button, skipButton, skipIntroText,
  // skip-*-icon, and future variants.
  const SKIP_TESTID_SELECTOR = '[data-testid*="skip" i]';
  const TESTID_BLOCKLIST = /skip[-_]?(to|link|nav)/i;

  // "Skip <segment>" wording across major Crunchyroll locales.
  const SKIP_LABEL_RE =
    /skip|überspringen|saltar|passer|pular|saltare|salta|presko|ohita|пропуст|スキップ|건너뛰|跳过|略過|ข้าม|lewati|atla/i;
  const LABEL_BLOCKLIST = /skip\s+to\s+(main|content|navigation)|main\s+content|navigation/i;

  const CLICKABLE = 'button, [role="button"]';

  const RETRY_MS = 3000;

  let clickedAt = new WeakMap();
  let lastHref = location.href;

  function isClickable(el) {
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    // Crunchyroll fades the button in/out with opacity but keeps it clickable;
    // only display:none / zero-size / disabled are real "not there yet" states.
    if (getComputedStyle(el).display === 'none') return false;
    const r = el.getBoundingClientRect();
    return r.width >= 4 && r.height >= 4;
  }

  function resolveClickable(el) {
    return (
      el.closest(CLICKABLE) ||
      (el.matches(CLICKABLE) ? el : el.querySelector(CLICKABLE)) ||
      el
    );
  }

  function describe(el) {
    return (
      el.getAttribute('data-testid') ||
      el.getAttribute('aria-label') ||
      (el.textContent || '').trim().slice(0, 40)
    );
  }

  function candidates() {
    const found = new Set();

    for (const el of document.querySelectorAll(SKIP_TESTID_SELECTOR)) {
      if (TESTID_BLOCKLIST.test(el.getAttribute('data-testid'))) continue;
      found.add(resolveClickable(el));
    }

    // Fallback: skip buttons we don't know a testid for.
    for (const el of document.querySelectorAll(CLICKABLE)) {
      const label = `${el.getAttribute('aria-label') || ''} ${el.textContent || ''}`;
      if (LABEL_BLOCKLIST.test(label)) continue;
      if (SKIP_LABEL_RE.test(label)) found.add(el);
    }

    return found;
  }

  function scan() {
    if (location.href !== lastHref) {
      lastHref = location.href;
      clickedAt = new WeakMap();
    }

    const now = Date.now();
    for (const el of candidates()) {
      if (!isClickable(el)) continue;
      const prev = clickedAt.get(el);
      if (prev && now - prev < RETRY_MS) continue;
      clickedAt.set(el, now);
      el.click();
      console.log(LOG, 'clicked', describe(el));
    }
  }

  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      scan();
    }, 50);
  }

  new MutationObserver(scheduleScan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  setInterval(scan, 1500);
  scan();
})();
