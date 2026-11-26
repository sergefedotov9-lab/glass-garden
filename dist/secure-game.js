"use strict";

const secureGame = (() => {
  let current;

  async function request(body) {
    const response = await fetch("/api/game", body ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    } : {});
    const result = await response.json();
    if (result.state) {
      current = result.state;
      document.dispatchEvent(new CustomEvent("garden-server-state", { detail: current }));
    }
    return result;
  }

  function previousSave() {
    try {
      return {
        difficulty: localStorage.getItem("glass-garden-difficulty"),
        legacy: JSON.parse(localStorage.getItem("glass-garden-city"))
      };
    } catch {
      return {};
    }
  }

  async function load() {
    try {
      const result = await request();
      return result.error === "not-initialized" ? await request({ action: "init", ...previousSave() }) : result;
    } catch {
      return { error: "unavailable" };
    }
  }

  async function action(name, fields) {
    try {
      if (!current) {
        const initialized = await load();
        if (!initialized.state) return initialized;
      }
      return await request({ action: name, revision: current.revision, ...fields });
    } catch {
      return { error: "unavailable" };
    }
  }

  return { load, action, get state() { return current; } };
})();
