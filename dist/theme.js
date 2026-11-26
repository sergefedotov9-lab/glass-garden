"use strict";

(() => {
  const storageKey = "glass-garden-theme";
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  let theme = "light";

  try {
    if (localStorage.getItem(storageKey) === "dark") theme = "dark";
  } catch {
    // The theme can still be changed for this session.
  }

  function applyTheme(value) {
    root.dataset.theme = value;
    themeColor.content = value === "dark" ? "#111c20" : "#dce9de";
  }

  applyTheme(theme);
  document.addEventListener("DOMContentLoaded", () => {
    for (const radio of document.querySelectorAll('#theme-options input[name="theme"]')) {
      radio.checked = radio.value === theme;
      radio.addEventListener("change", () => {
        applyTheme(radio.value);
        try {
          localStorage.setItem(storageKey, radio.value);
        } catch {
          // Keep the chosen theme for the current session.
        }
      });
    }
  });
})();
