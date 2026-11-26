"use strict";

(() => {
  const projects = {
    quarter: { name: "cityQuarter", price: 300 },
    conservatory: { name: "cityConservatory", price: 650 },
    tower: { name: "cityTower", price: 1200 },
    skyline: { name: "citySkyline", price: 2400 }
  };
  const lotCount = 16;
  const dialog = document.querySelector("#city");
  const get = id => document.getElementById(id);
  const { t, formatNumber, formatPercent } = gardenLanguage;
  const mapCanvas = get("city-canvas");
  const mapViewport = get("city-map");
  const mapSurface = get("city-map-surface");
  const zoomOut = get("city-zoom-out");
  const zoomIn = get("city-zoom-in");
  const zoomLevels = [1, 1.25, 1.5, 2, 2.5, 3];
  const build = get("city-build");
  const lotSelect = get("city-lot-select");
  const roadEnd = get("city-road-end");
  const roadModeButton = get("city-mode-roads");
  const buildingModeButton = get("city-mode-buildings");
  const feedback = get("city-feedback");
  let state = { balance: 0, lots: Array(lotCount).fill(null) };
  let selectedLot = 0;
  let selectedRoadEnd = 1;
  let roadMode = false;
  let selectedProject = "quarter";
  let lastBuilding = null;
  let buildingInProgress = false;
  let buildError = false;
  let zoomIndex = 0;
  let opened = false;
  let paintedMap = "";

  function roadExists(segment) {
    return (state.roads ?? []).some(([from, to]) => from === segment[0] && to === segment[1]);
  }

  function clearFeedback() {
    lastBuilding = null;
    buildError = false;
  }

  function changeMode(roads) {
    roadMode = roads;
    clearFeedback();
    render();
  }

  roadModeButton.addEventListener("click", () => changeMode(true));
  buildingModeButton.addEventListener("click", () => changeMode(false));
  roadEnd.addEventListener("change", () => {
    selectedRoadEnd = Number(roadEnd.value);
    clearFeedback();
    render();
  });

  function renderZoom() {
    get("city-scale").textContent = formatPercent(zoomLevels[zoomIndex]);
    zoomOut.setAttribute("aria-disabled", String(zoomIndex === 0));
    zoomIn.setAttribute("aria-disabled", String(zoomIndex === zoomLevels.length - 1));
  }

  function centerSelectedLot() {
    if (zoomIndex === 0) return;
    const [x, y] = cityArt.plot(selectedLot);
    mapViewport.scrollLeft = x / cityArt.width * mapSurface.clientWidth - mapViewport.clientWidth / 2;
    mapViewport.scrollTop = y / cityArt.height * mapSurface.clientHeight - mapViewport.clientHeight / 2;
  }

  function setZoom(next) {
    zoomIndex = next;
    mapViewport.dataset.zoomed = String(next > 0);
    mapSurface.style.width = `${zoomLevels[zoomIndex] * 100}%`;
  }

  function zoomBy(direction) {
    const next = zoomIndex + direction;
    if (next < 0 || next >= zoomLevels.length) return;
    setZoom(next);
    centerSelectedLot();
    renderZoom();
    drawMap();
  }

  zoomOut.addEventListener("click", () => zoomBy(-1));
  zoomIn.addEventListener("click", () => zoomBy(1));

  const plots = Array.from({ length: lotCount }, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "city-plot";
    const [x, y] = cityArt.plot(index);
    button.style.left = `${x / cityArt.width * 100}%`;
    button.style.top = `${y / cityArt.height * 100}%`;
    const badge = document.createElement("span");
    badge.setAttribute("aria-hidden", "true");
    button.append(badge);
    button.addEventListener("click", () => {
      if (roadMode && gardenRoads.adjacent(selectedLot, index)) selectedRoadEnd = index;
      else selectedLot = index;
      clearFeedback();
      render();
    });
    get("city-plots").append(button);
    const option = document.createElement("option");
    option.value = index;
    lotSelect.append(option);
    return { button, badge, option };
  });
  lotSelect.addEventListener("change", () => {
    selectedLot = Number(lotSelect.value);
    clearFeedback();
    render();
    centerSelectedLot();
  });

  const catalog = Object.entries(projects).map(([id, project]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button city-card";
    const icon = document.createElement("canvas");
    icon.width = 72;
    icon.height = 78;
    icon.setAttribute("aria-hidden", "true");
    cityArt.icon(icon, id);
    const name = document.createElement("strong");
    const price = document.createElement("span");
    price.dataset.price = "";
    button.append(icon, name, price);
    button.addEventListener("click", () => {
      selectedProject = id;
      clearFeedback();
      render();
    });
    get("city-catalog").append(button);
    return { id, project, button, name, price };
  });

  function render() {
    get("city-pocket").textContent = formatNumber(state.balance);
    if (!dialog.open) return;
    renderZoom();

    const used = state.lots.filter(Boolean).length;
    const current = state.lots[selectedLot];
    const price = roadMode ? gardenRoads.price : projects[selectedProject].price;
    const roads = state.roads ?? [];
    if (roadMode) {
      const neighbors = gardenRoads.neighbors(selectedLot);
      if (!neighbors.includes(selectedRoadEnd)) selectedRoadEnd = neighbors[0];
      roadEnd.replaceChildren(...neighbors.map(index => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = t("roadLot", { lot: index + 1 });
        return option;
      }));
      roadEnd.value = selectedRoadEnd;
    }
    const occupied = roadMode ? roadExists(gardenRoads.segment(selectedLot, selectedRoadEnd)) : Boolean(current);
    roadModeButton.setAttribute("aria-pressed", String(roadMode));
    buildingModeButton.setAttribute("aria-pressed", String(!roadMode));
    get("city-catalog").hidden = roadMode;
    get("city-road-controls").hidden = !roadMode;
    get("city-road-guide").hidden = !roadMode;
    get("city-road-price").textContent = t("cityPrice", { price: gardenRoads.price });
    build.textContent = t(roadMode ? "roadBuild" : "cityBuild");
    get("city-balance").textContent = formatNumber(state.balance);
    get("city-built").textContent = `${formatNumber(used)} / ${formatNumber(lotCount)}`;
    get("city-roads").textContent = `${formatNumber(roads.length)} / ${formatNumber(gardenRoads.count)}`;
    for (const [index, { button, badge, option }] of plots.entries()) {
      const lot = state.lots[index];
      const values = { lot: index + 1, name: lot ? t(projects[lot].name) : "" };
      const label = t(lot ? "cityLotBuilt" : "cityLotEmpty", values);
      button.dataset.built = String(Boolean(lot));
      button.setAttribute("aria-pressed", String(index === selectedLot || (roadMode && index === selectedRoadEnd)));
      button.setAttribute("aria-label", label);
      badge.textContent = formatNumber(index + 1);
      option.textContent = label;
    }
    for (const { id, project, button, name, price: priceLabel } of catalog) {
      button.setAttribute("aria-pressed", String(id === selectedProject));
      name.textContent = t(project.name);
      priceLabel.textContent = t("cityPrice", { price: project.price });
    }
    lotSelect.value = selectedLot;
    build.disabled = buildingInProgress || occupied || state.balance < price || !secureGame.state;
    if (buildError) {
      feedback.textContent = t("secureUnavailable");
    } else if (lastBuilding) {
      feedback.textContent = lastBuilding === "road" ? t("roadSuccess") : t("citySuccess", { name: t(projects[lastBuilding].name) });
    } else if (roadMode && occupied) {
      feedback.textContent = t("roadExists");
    } else if (!occupied && state.balance < price) {
      feedback.textContent = t("cityNeed", { points: price - state.balance });
    } else if (!roadMode && used === lotCount) {
      feedback.textContent = t("cityFull");
    } else {
      feedback.textContent = "";
    }
    drawMap();
  }

  function drawMap() {
    if (!dialog.open || !mapSurface.clientWidth) return;
    const width = Math.min(2400, Math.ceil(mapSurface.clientWidth * Math.min(devicePixelRatio || 1, 2)));
    const dark = document.documentElement.dataset.theme === "dark";
    const roads = state.roads ?? [];
    const preview = roadMode ? gardenRoads.segment(selectedLot, selectedRoadEnd) : null;
    const view = `${width}|${dark}|${selectedLot}|${state.lots.join(",")}|${JSON.stringify(roads)}|${preview}`;
    if (view === paintedMap) return;
    paintedMap = view;
    if (mapCanvas.width !== width) {
      mapCanvas.width = width;
      mapCanvas.height = Math.round(width * cityArt.height / cityArt.width);
    }
    cityArt.map(mapCanvas, state.lots, selectedLot, dark, roads, preview);
  }

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(drawMap).observe(mapSurface);
  }

  get("open-city").addEventListener("click", () => {
    if (secureGame.state) state = secureGame.state;
    const firstEmpty = state.lots.indexOf(null);
    if (!roadMode && state.lots[selectedLot] && firstEmpty >= 0) selectedLot = firstEmpty;
    clearFeedback();
    dialog.showModal();
    if (!opened && matchMedia("(max-width: 700px)").matches) {
      setZoom(1);
      mapViewport.scrollLeft = (mapViewport.scrollWidth - mapViewport.clientWidth) / 2;
      mapViewport.scrollTop = mapViewport.scrollHeight - mapViewport.clientHeight;
    } else {
      centerSelectedLot();
    }
    opened = true;
    render();
  });

  build.addEventListener("click", async () => {
    if (build.disabled) return;
    buildingInProgress = true;
    const lot = selectedLot;
    const id = roadMode ? "road" : selectedProject;
    const end = selectedRoadEnd;
    build.disabled = true;
    try {
      const reply = id === "road"
        ? await secureGame.action("road", { first: lot, second: end })
        : await secureGame.action("build", { project: id, lot });
      buildError = Boolean(reply.error);
      if (!buildError) lastBuilding = id;
    } finally {
      buildingInProgress = false;
      render();
    }
  });

  document.addEventListener("garden-server-state", ({ detail }) => {
    state = detail;
    render();
  });
  document.addEventListener("garden-language-change", render);
  if (secureGame.state) state = secureGame.state;
  render();
})();
