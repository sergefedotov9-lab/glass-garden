"use strict";

(() => {
  const key = "glass-garden-tutorial";
  const loading = document.querySelector("#loading-screen");
  const poster = document.querySelector("#loading-city");
  const main = document.querySelector("main");
  const tutorial = document.querySelector("#tutorial");
  const settings = document.querySelector("#settings");
  const replay = document.querySelector("#open-tutorial");
  const next = document.querySelector("#tutorial-next");
  const back = document.querySelector("#tutorial-back");
  const skip = document.querySelector("#tutorial-skip");
  const steps = ["Goal", "Match", "Build"];
  let index = 0;
  let fromSettings = false;
  let seen = false;

  try {
    seen = localStorage.getItem(key) === "1";
  } catch {
    // Show the guide when saved preferences are unavailable.
  }

  function render() {
    const topic = steps[index];
    tutorial.dataset.step = topic.toLowerCase();
    gardenLanguage.write(document.querySelector("#tutorial-step"), "introStep", { step: index + 1, total: steps.length });
    gardenLanguage.write(document.querySelector("#tutorial-title"), `intro${topic}Title`);
    gardenLanguage.write(document.querySelector("#tutorial-copy"), `intro${topic}Copy`);
    gardenLanguage.write(next, index === steps.length - 1 ? "introPlay" : "introNext");
    back.hidden = index === 0;
    skip.hidden = index !== 0;
  }

  function open() {
    index = 0;
    render();
    tutorial.showModal();
  }

  next.addEventListener("click", () => {
    if (index === steps.length - 1) {
      tutorial.close();
    } else {
      index++;
      render();
    }
  });
  back.addEventListener("click", () => {
    if (index === 0) return;
    index--;
    render();
    if (back.hidden) next.focus();
  });
  skip.addEventListener("click", () => tutorial.close());
  replay.addEventListener("click", () => {
    fromSettings = true;
    settings.close();
    open();
  });
  tutorial.addEventListener("close", () => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // The game remains playable without saving this preference.
    }
    if (fromSettings) {
      fromSettings = false;
      settings.showModal();
      replay.focus();
    } else {
      document.querySelector(".cell[tabindex='0']")?.focus({ preventScroll: true });
    }
  });

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function enterGame() {
    await Promise.all([wait(520), Promise.race([poster.decode().catch(() => {}), wait(950)])]);
    loading.classList.add("loading-done");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) await wait(170);
    loading.hidden = true;
    main.inert = false;
    if (!seen) open();
  }

  void enterGame();
})();
