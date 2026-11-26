"use strict";

(() => {
  const storageKey = "glass-garden-background";
  const options = document.querySelector("#background-options");
  const radios = [...options.querySelectorAll('input[name="background"]')];
  const customOption = document.querySelector("#custom-background-option");
  const customPreview = customOption.querySelector("img");
  const choosePhoto = document.querySelector("#choose-background");
  const photoInput = document.querySelector("#background-file");
  const feedback = document.querySelector("#background-status");
  let selected = "garden";
  let photo = "";

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (typeof saved?.photo === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(saved.photo)) {
      photo = saved.photo;
    }
    if (radios.some(radio => radio.value === saved?.selected) && (saved.selected !== "custom" || photo)) {
      selected = saved.selected;
    }
  } catch {
    // The current session can still use the background picker.
  }

  function renderBackground() {
    customOption.hidden = !photo;
    if (photo) customPreview.src = photo;
    for (const radio of radios) radio.checked = radio.value === selected;
    document.body.dataset.background = selected;
    if (selected === "custom") {
      document.body.style.setProperty("--garden-image", `url("${photo}")`);
    } else {
      document.body.style.removeProperty("--garden-image");
    }
  }

  function applyBackground() {
    renderBackground();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ selected, photo }));
      gardenLanguage.write(feedback, null);
    } catch {
      gardenLanguage.write(feedback, "temporary");
    }
  }

  async function preparePhoto(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { alpha: false });
      context.fillStyle = "#dceadf";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", .83);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  for (const radio of radios) {
    radio.addEventListener("change", () => {
      selected = radio.value;
      applyBackground();
    });
  }
  choosePhoto.addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;
    photoInput.value = "";
    choosePhoto.disabled = true;
    try {
      photo = await preparePhoto(file);
      selected = "custom";
      applyBackground();
    } catch {
      gardenLanguage.write(feedback, "badImage");
    } finally {
      choosePhoto.disabled = false;
    }
  });

  renderBackground();
})();
