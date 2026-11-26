"use strict";

const ambientMusic = (() => {
  const key = "glass-garden-music";
  const audio = document.querySelector("#garden-music");
  const toggle = document.querySelector("#music-toggle");
  let enabled = true;
  let activated = false;
  try {
    enabled = localStorage.getItem(key) !== "off";
  } catch {
    // Keep the default for this session.
  }

  function sync() {
    toggle.setAttribute("aria-pressed", String(enabled));
    const { level, muted } = glassSound;
    if (!enabled || muted || !level || document.hidden) {
      if (!audio.paused) audio.pause();
      return;
    }
    audio.volume = .28 * (level / 100) ** 1.3;
    if (activated && audio.paused) {
      void audio.play().catch(() => {
        // Mobile browsers can require another user gesture before playing.
      });
    }
  }

  document.addEventListener("click", event => {
    if (event.target.closest("#music-toggle")) return;
    if (activated && !audio.paused) return;
    activated = true;
    sync();
  }, true);
  document.addEventListener("visibilitychange", sync);
  toggle.addEventListener("click", () => {
    activated = true;
    enabled = !enabled;
    try {
      localStorage.setItem(key, enabled ? "on" : "off");
    } catch {
      // Keep the chosen preference for the current session.
    }
    sync();
  });
  sync();
  return { sync };
})();
