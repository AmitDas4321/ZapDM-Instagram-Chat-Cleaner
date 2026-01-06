const SCOPE_SELECTOR = 'document';

(function () {
  const scope = SCOPE_SELECTOR === 'document'
    ? document
    : document.querySelector(SCOPE_SELECTOR) || document;

  const isEditable = (el) =>
    !!el &&
    (el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'));

  const blockIfNotEditable = (e) => {
    if (!isEditable(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Visual + behavioral: disable selection on the chosen scope
  const applyNoSelectStyle = (el) => {
    try {
      el.style.userSelect = 'none';
      el.style.webkitUserSelect = 'none';
      el.style.msUserSelect = 'none';
      el.style.MozUserSelect = 'none';
      el.style.webkitTouchCallout = 'none'; // iOS long-press
    } catch {}
  };

  const targetEl = scope === document ? document.documentElement : scope;
  applyNoSelectStyle(targetEl);

  // Block selection, drag, and context menu
  scope.addEventListener('selectstart', blockIfNotEditable, true);
  scope.addEventListener('dragstart', blockIfNotEditable, true);
  scope.addEventListener('contextmenu', blockIfNotEditable, true);

  // Block clipboard events
  ['copy', 'cut', 'paste'].forEach((evt) => {
    scope.addEventListener(evt, blockIfNotEditable, true);
  });

  // Block common keyboard shortcuts outside editable fields
  scope.addEventListener(
    'keydown',
    (e) => {
      if (isEditable(e.target)) return;
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a', 's', 'p', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.shiftKey && (key === 'arrowleft' || key === 'arrowright' || key === 'arrowup' || key === 'arrowdown')) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Optional: prevent double-tap select on some mobile browsers
  let lastTouch = 0;
  scope.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouch < 350 && !isEditable(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
      lastTouch = now;
    },
    { passive: false, capture: true }
  );

  // Guard: re-apply styles if DOM changes (SPAs, etc.)
  const observer = new MutationObserver(() => applyNoSelectStyle(targetEl));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();


// ===============================
// 7) DevTools detection redirect
// ===============================
// Note: This can cause false positives and redirect legitimate users.
// Use with care; advanced users can bypass it.
(function () {
  const devtools = /./;
  devtools.opened = false;

  devtools.toString = function () {
    this.opened = true;
    return '';
  };

  const checkDevTools = new Function('debugger;');

  setInterval(function () {
    const wasOpened = devtools.opened;
    devtools.opened = false;

    checkDevTools();

    if (devtools.opened || wasOpened) {
      window.location.href = 'https://www.google.com';
    }
  }, 1000);
})();
