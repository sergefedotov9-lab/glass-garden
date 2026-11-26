"use strict";

const { size, difficulties, swap, findMove } = gardenEngine;

const types = [
  { name: "ruby", hue: 349, mark: "✿" },
  { name: "amber", hue: 33, mark: "✷" },
  { name: "emerald", hue: 145, mark: "✦" },
  { name: "azure", hue: 195, mark: "≈" },
  { name: "amethyst", hue: 269, mark: "✧" },
  { name: "pink", hue: 313, mark: "◈" }
];

const ui = Object.fromEntries(
  Array.from(document.querySelectorAll("[id]"), element => [element.id, element])
);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const cells = [];
const orbs = [];
const visibleTypes = Array(size * size);
let renderedSelection = -1;
let renderedHint = [];
let renderedFocus = -1;
let grid = Array(size * size).fill(null);
let score = 0;
let moves = 0;
let selected = -1;
let suggested = [];
let activeCell = 0;
let busy = true;
let finished = true;
let difficulty = "normal";
let pointer = null;
let swiped = false;

function render() {
  if (renderedSelection !== selected) {
    if (renderedSelection >= 0) {
      cells[renderedSelection].classList.remove("selected");
      cells[renderedSelection].setAttribute("aria-pressed", "false");
    }
    if (selected >= 0) {
      cells[selected].classList.add("selected");
      cells[selected].setAttribute("aria-pressed", "true");
    }
    renderedSelection = selected;
  }
  if (renderedHint !== suggested) {
    for (const index of renderedHint) cells[index].classList.remove("suggested");
    for (const index of suggested) cells[index].classList.add("suggested");
    renderedHint = suggested;
  }
  if (renderedFocus !== activeCell) {
    if (renderedFocus >= 0) cells[renderedFocus].tabIndex = -1;
    cells[activeCell].tabIndex = 0;
    renderedFocus = activeCell;
  }
  for (let index = 0; index < cells.length; index++) {
    const value = grid[index];
    if (visibleTypes[index] === value) continue;
    visibleTypes[index] = value;
    const type = types[value];
    const row = Math.floor(index / size) + 1;
    const column = index % size + 1;
    const label = type
      ? gardenLanguage.t("cell", { row, column, color: gardenLanguage.t(type.name) })
      : gardenLanguage.t("empty", { row, column });
    cells[index].setAttribute("aria-label", label);
    const orb = orbs[index];
    orb.hidden = !type;
    if (type) {
      orb.style.setProperty("--h", type.hue);
      orb.firstElementChild.textContent = type.mark;
    }
  }
  const { goal } = difficulties[difficulty];
  for (const [element, value] of [[ui.score, score], [ui.target, goal], [ui.moves, moves]]) {
    const label = gardenLanguage.formatNumber(value);
    if (element.textContent !== label) element.textContent = label;
  }
  if (ui.progress.max !== goal) ui.progress.max = goal;
  if (ui.progress.value !== Math.min(score, goal)) ui.progress.value = score;
  ui.hint.disabled = busy || finished;
  ui.restart.disabled = busy;
  ui["open-settings"].disabled = busy;
  ui["open-city"].disabled = busy;
}

function applyRound(state) {
  difficulty = state.difficulty;
  grid = state.grid.slice();
  score = state.score;
  moves = state.moves;
  selected = -1;
  suggested = [];
  finished = state.finished;
}

async function start(nextDifficulty = difficulty, initial = false) {
  if (ui.result.open) ui.result.close();
  busy = true;
  render();
  const reply = initial ? await secureGame.load() : await secureGame.action("start", { difficulty: nextDifficulty });
  if (reply.state) applyRound(reply.state);
  busy = false;
  if (reply.error) gardenLanguage.write(ui.status, "secureUnavailable");
  else if (finished) gardenLanguage.write(ui.status, "summary", { score, goal: difficulties[difficulty].goal });
  else gardenLanguage.write(ui.status, "instruction");
  render();
}

async function shatter(matched) {
  if (reducedMotion.matches) return;
  const indices = [...matched];
  const count = Math.min(12, indices.length);
  const breaking = Array.from({ length: count }, (_, index) => orbs[indices[Math.floor(index * indices.length / count)]]);
  for (const orb of breaking) orb.classList.add("breaking");
  const animations = breaking.map(orb => orb.animate([
    { transform: "scale3d(1, 1, 1)", opacity: 1 },
    { transform: "scale3d(1.08, 1.08, 1)", opacity: .95, offset: .24 },
    { transform: "scale3d(.68, .68, 1)", opacity: 0 }
  ], { duration: 132, easing: "ease-out", fill: "forwards" }));
  await animationEnd(animations);
  for (const orb of breaking) orb.classList.remove("breaking");
  for (const animation of animations) animation.cancel();
}

function animateDrop(falling) {
  if (reducedMotion.matches) return [];
  const rowPitch = cells[size].getBoundingClientRect().top - cells[0].getBoundingClientRect().top;
  return falling.map(([index, distance]) => orbs[index].animate(
    [{ transform: `translate3d(0, ${-rowPitch * distance}px, 0)` },
     { transform: "translate3d(0, 0, 0)" }],
    { duration: 188 + 18 * Math.min(distance, 5), easing: "cubic-bezier(.35,.05,.28,1)" }
  ));
}

function animateSwap(first, second) {
  if (reducedMotion.matches) return [];
  const a = cells[first].getBoundingClientRect();
  const b = cells[second].getBoundingClientRect();
  return [[first, b.left - a.left, b.top - a.top], [second, a.left - b.left, a.top - b.top]]
    .map(([index, x, y]) => orbs[index].animate(
      [{ transform: "translate3d(0, 0, 0)" }, { transform: `translate3d(${x}px, ${y}px, 0)` }],
      { duration: 148, easing: "cubic-bezier(.28,.05,.3,1)", fill: "forwards" }
    ));
}

function animationEnd(animations) {
  return Promise.allSettled(animations.map(animation => animation.finished));
}

async function animatedSwap(first, second) {
  const animations = animateSwap(first, second);
  await animationEnd(animations);
  swap(grid, first, second);
  render();
  for (const animation of animations) animation.cancel();
}

function showResult() {
  finished = true;
  const { goal } = difficulties[difficulty];
  const won = score >= goal;
  gardenLanguage.write(ui["result-title"], won ? "win" : "lose");
  gardenLanguage.write(ui["result-summary"], "summary", { score, goal });
  gardenLanguage.write(ui.status, "summary", { score, goal });
  ui.result.showModal();
}

async function turn(first, second) {
  busy = true;
  selected = -1;
  suggested = [];
  render();
  const requested = secureGame.action("move", { first, second });
  await animatedSwap(first, second);
  const reply = await requested;
  if (reply.error || !reply.waves.length) {
    await animatedSwap(first, second);
    if (reply.state) applyRound(reply.state);
    gardenLanguage.write(ui.status, reply.error ? "secureUnavailable" : "invalid");
  } else {
    moves = reply.state.moves;
    for (const [index, wave] of reply.waves.entries()) {
      const chain = index + 1;
      glassSound.play(wave.cleared.map(i => (i % size) / (size - 1) * 2 - 1), chain);
      score += wave.points;
      gardenLanguage.write(ui.status, chain === 1 ? "points" : "cascade", { points: wave.points, chain });
      render();
      await shatter(wave.cleared);
      grid = wave.grid;
      render();
      await animationEnd(animateDrop(wave.falling));
    }
    applyRound(reply.state);
    if (finished) showResult();
    else if (reply.reshuffled) gardenLanguage.write(ui.status, "reshuffle");
  }
  busy = false;
  render();
}

document.addEventListener("garden-server-state", ({ detail }) => {
  if (busy || (detail.score === score && detail.moves === moves && detail.grid.every((value, index) => value === grid[index]))) return;
  applyRound(detail);
  render();
});

function adjacent(first, second) {
  return Math.abs(Math.floor(first / size) - Math.floor(second / size)) +
    Math.abs(first % size - second % size) === 1;
}

function pick(index) {
  if (busy || finished) return;
  void glassSound.unlock();
  activeCell = index;
  suggested = [];
  if (selected >= 0 && adjacent(selected, index)) {
    void turn(selected, index);
    return;
  }
  selected = selected === index ? -1 : index;
  gardenLanguage.write(ui.status, selected < 0 ? "pick" : "neighbor");
  render();
}

for (let index = 0; index < size * size; index++) {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "cell";
  cell.tabIndex = -1;
  cell.setAttribute("aria-pressed", "false");
  cell.dataset.index = index;
  cell.innerHTML = '<span class="orb" aria-hidden="true"><span></span></span>';
  cell.addEventListener("click", () => pick(index));
  cells.push(cell);
  orbs.push(cell.firstElementChild);
  ui.board.append(cell);
}

function neighborFor(index, dx, dy) {
  const row = Math.floor(index / size) + dy;
  const column = index % size + dx;
  return row >= 0 && row < size && column >= 0 && column < size ? row * size + column : -1;
}

ui.board.addEventListener("keydown", event => {
  const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (!directions[event.key]) return;
  event.preventDefault();
  const next = neighborFor(Number(event.target.dataset.index), ...directions[event.key]);
  if (next < 0) return;
  activeCell = next;
  render();
  cells[next].focus();
});

ui.board.addEventListener("pointerdown", event => {
  swiped = false;
  const cell = event.target.closest(".cell");
  if (!cell || busy || finished || !event.isPrimary || event.button !== 0) return;
  void glassSound.unlock();
  pointer = { id: event.pointerId, index: Number(cell.dataset.index), x: event.clientX, y: event.clientY };
  cell.setPointerCapture(event.pointerId);
});

ui.board.addEventListener("pointerup", event => {
  if (pointer?.id !== event.pointerId) return;
  const { index, x, y } = pointer;
  pointer = null;
  const dx = event.clientX - x;
  const dy = event.clientY - y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
  const next = Math.abs(dx) >= Math.abs(dy)
    ? neighborFor(index, Math.sign(dx), 0)
    : neighborFor(index, 0, Math.sign(dy));
  if (next >= 0 && !busy && !finished) {
    activeCell = next;
    void turn(index, next);
  }
  swiped = true;
});

ui.board.addEventListener("click", event => {
  if (!swiped || event.detail === 0) return;
  swiped = false;
  event.stopImmediatePropagation();
}, true);

ui.board.addEventListener("pointercancel", () => { pointer = null; });
ui.hint.addEventListener("click", () => {
  selected = -1;
  suggested = findMove(grid);
  gardenLanguage.write(ui.status, "hintStatus");
  render();
});
function renderAudioControls() {
  const { level, muted, supported } = glassSound;
  const display = gardenLanguage.formatPercent(level / 100);
  ui.volume.value = level;
  ui.volume.setAttribute("aria-valuetext", display);
  ui["volume-value"].textContent = display;
  ui.sound.setAttribute("aria-pressed", String(muted));
  gardenLanguage.write(ui["sound-label"], muted || level === 0 ? "off" : "on");
  ui.volume.disabled = !supported;
  ui.sound.disabled = !supported;
  ui.listen.disabled = !supported || muted || level === 0;
  ambientMusic.sync();
}

ui.volume.addEventListener("input", () => {
  const level = Number(ui.volume.value);
  glassSound.setPreferences(level, false);
  renderAudioControls();
  void glassSound.unlock();
});
ui.sound.addEventListener("click", () => {
  const { level, muted } = glassSound;
  glassSound.setPreferences(level || 75, level !== 0 && !muted);
  renderAudioControls();
  void glassSound.unlock();
});
ui.listen.addEventListener("click", () => { void glassSound.preview(); });
document.addEventListener("garden-language-change", () => {
  visibleTypes.fill(undefined);
  renderAudioControls();
  render();
});
renderAudioControls();

const difficultyForm = ui["difficulty-form"];
const difficultyOptions = difficultyForm.elements.namedItem("difficulty");
const applyDifficulty = ui["apply-difficulty"];

ui["open-settings"].addEventListener("click", () => {
  difficultyOptions.value = difficulty;
  applyDifficulty.disabled = true;
  ui.settings.showModal();
});
difficultyForm.addEventListener("change", () => {
  applyDifficulty.disabled = difficultyOptions.value === difficulty;
});
difficultyForm.addEventListener("submit", async event => {
  event.preventDefault();
  const next = difficultyOptions.value;
  if (busy || next === difficulty || !Object.hasOwn(difficulties, next)) return;
  ui.settings.close();
  await start(next);
  cells[0].focus();
});

ui.restart.addEventListener("click", () => { void start(); });
ui.again.addEventListener("click", async () => {
  await start();
  cells[0].focus();
});
void start(difficulty, true);
