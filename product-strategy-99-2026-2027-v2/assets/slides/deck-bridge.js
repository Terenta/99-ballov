(() => {
  'use strict';
  if (window.parent === window) return;
  let active = false;
  const videos = [...document.querySelectorAll('video')];
  const originalControls = new Map(videos.map(video => [video, video.controls]));
  const navigationKeys = new Set(['ArrowRight', 'PageDown', ' ', 'ArrowLeft', 'PageUp', 'Home', 'End']);
  function syncMedia() {
    for (const video of videos) {
      if (!active) { video.pause(); continue; }
      video.muted = true;
      video.controls = originalControls.get(video);
      video.play().catch(() => { if (active) video.controls = true; });
    }
  }
  document.addEventListener('play', event => {
    if (!active && videos.includes(event.target)) event.target.pause();
  }, true);
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.data?.type !== 'strategy-deck:state') return;
    const nextActive = event.data.active === true;
    if (nextActive === active) return;
    active = nextActive;
    syncMedia();
  });
  document.addEventListener('keydown', event => {
    if (!navigationKeys.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.parent.postMessage({ type: 'strategy-deck:navigate', key: event.key }, '*');
  }, true);
  window.addEventListener('pagehide', () => { active = false; syncMedia(); });
  syncMedia();
  window.parent.postMessage({ type: 'strategy-deck:ready' }, '*');
})();
