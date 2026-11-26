const projects = { quarter: 300, conservatory: 650, tower: 1200, skyline: 2400 };
const { size, difficulties, makeGrid, matches, swap, findMove, refill } = gardenEngine;
const mimeTypes = {
  html: "text/html; charset=utf-8", css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8", webp: "image/webp", mp3: "audio/mpeg"
};
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'"
};
const decodedAssets = new Map();

function json(body, status = 200) {
  return Response.json(body, { status, headers: { ...securityHeaders, "Cache-Control": "private, no-store" } });
}

function reset(difficulty) {
  return { difficulty, grid: makeGrid(), moves: difficulties[difficulty].moves, score: 0, finished: false };
}

async function player(db, user) {
  const row = await db.prepare("SELECT revision, updated_at, state FROM garden_players WHERE user_id = ?")
    .bind(user).first();
  return row && { revision: row.revision, updatedAt: row.updated_at, state: JSON.parse(row.state) };
}

async function identity(request, db) {
  const id = request.headers.get("oai-authenticated-user-id")?.trim();
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return id;
  // Keep saves already created with an ID when both identity headers are available.
  if (id && await player(db, id)) return id;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return "email:" + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

const publicState = row => ({ ...row.state, revision: row.revision });
const validIndex = (index, max) => Number.isInteger(index) && index >= 0 && index < max;

function legacyCity(legacy) {
  return {
    balance: Number.isSafeInteger(legacy?.balance) && legacy.balance >= 0 ? legacy.balance : 0,
    lots: Array.from({ length: 16 }, (_, i) => Object.hasOwn(projects, legacy?.lots?.[i]) ? legacy.lots[i] : null)
  };
}

function resolve(state, first, second) {
  if (state.finished || !validIndex(first, size * size) || !validIndex(second, size * size) ||
      Math.abs(Math.floor(first / size) - Math.floor(second / size)) + Math.abs(first % size - second % size) !== 1) {
    return { error: "invalid-move" };
  }
  const grid = state.grid.slice();
  swap(grid, first, second);
  let matched = matches(grid);
  if (!matched.size) return { waves: [] };

  let earned = 0;
  const waves = [];
  for (let chain = 1; matched.size && chain <= 24; chain++) {
    const cleared = [...matched];
    const points = cleared.length * 20 * chain;
    earned += points;
    for (const index of cleared) grid[index] = null;
    const falling = refill(grid);
    waves.push({ cleared, points, falling, grid: grid.slice() });
    matched = matches(grid);
  }
  state.moves--;
  state.score += earned;
  state.balance = Math.min(Number.MAX_SAFE_INTEGER, state.balance + earned);
  state.finished = state.moves === 0 || state.score >= difficulties[state.difficulty].goal;
  const reshuffled = Boolean(matched.size || (!state.finished && !findMove(grid).length));
  state.grid = reshuffled ? makeGrid() : grid;
  return { waves, reshuffled };
}

async function readPayload(request) {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return null;
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return null;
  if (request.headers.get("Content-Type")?.split(";")[0] !== "application/json" || !request.body) return null;

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 4096) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  try {
    const input = JSON.parse(text + decoder.decode());
    return input && typeof input === "object" && !Array.isArray(input) ? input : null;
  } catch {
    return null;
  }
}

async function game(request, env) {
  if (!env.DB) return json({ error: "unavailable" }, 503);
  const user = await identity(request, env.DB);
  if (!user) return json({ error: "authentication-required" }, 401);
  if (request.method === "GET") {
    const existing = await player(env.DB, user);
    return existing ? json({ state: publicState(existing) }) : json({ error: "not-initialized" }, 404);
  }
  if (request.method !== "POST") return json({ error: "method" }, 405);
  const input = await readPayload(request);
  if (!input) return json({ error: "request" }, 400);
  const fields = {
    init: ["action", "difficulty", "legacy"], start: ["action", "difficulty", "revision"],
    move: ["action", "first", "second", "revision"], build: ["action", "project", "lot", "revision"],
    road: ["action", "first", "second", "revision"]
  };
  if (!Object.hasOwn(fields, input.action) || Object.keys(input).some(key => !fields[input.action].includes(key))) {
    return json({ error: "request" }, 400);
  }

  const current = await player(env.DB, user);
  const now = Date.now();
  if (input.action === "init") {
    if (!current) {
      const difficulty = Object.hasOwn(difficulties, input.difficulty) ? input.difficulty : "normal";
      const initial = { ...reset(difficulty), ...legacyCity(input.legacy) };
      await env.DB.prepare("INSERT INTO garden_players (user_id, updated_at, state) VALUES (?, ?, ?) ON CONFLICT(user_id) DO NOTHING")
        .bind(user, now, JSON.stringify(initial)).run();
    }
    return json({ state: publicState(current ?? await player(env.DB, user)) });
  }
  if (!current) return json({ error: "not-initialized" }, 404);
  if (input.revision !== current.revision) return json({ error: "conflict", state: publicState(current) }, 409);

  const state = current.state;
  let outcome = {};
  if (input.action === "move") {
    if (now - current.updatedAt < 100) return json({ error: "too-fast", state: publicState(current) }, 429);
    outcome = resolve(state, input.first, input.second);
    if (outcome.error) return json(outcome, 400);
    if (outcome.waves.length === 0) return json({ ...outcome, state: publicState(current) });
  } else if (input.action === "start") {
    if (!Object.hasOwn(difficulties, input.difficulty)) return json({ error: "difficulty" }, 400);
    Object.assign(state, reset(input.difficulty));
  } else if (input.action === "road") {
    if (!gardenRoads.adjacent(input.first, input.second)) return json({ error: "invalid-road" }, 400);
    const segment = gardenRoads.segment(input.first, input.second);
    const roads = state.roads ?? [];
    if (roads.some(([from, to]) => from === segment[0] && to === segment[1]) ||
        state.balance < gardenRoads.price) return json({ error: "cannot-build", state: publicState(current) }, 422);
    state.roads = [...roads, segment];
    state.balance -= gardenRoads.price;
  } else {
    const price = projects[input.project];
    if (!Object.hasOwn(projects, input.project) || !validIndex(input.lot, state.lots.length) ||
        state.lots[input.lot] !== null || state.balance < price) return json({ error: "cannot-build", state: publicState(current) }, 422);
    state.lots[input.lot] = input.project;
    state.balance -= price;
  }

  const result = await env.DB.prepare("UPDATE garden_players SET revision = revision + 1, updated_at = ?, state = ? WHERE user_id = ? AND revision = ?")
    .bind(now, JSON.stringify(state), user, current.revision).run();
  if (result.meta.changes !== 1) return json({ error: "conflict", state: publicState(await player(env.DB, user)) }, 409);
  return json({ ...outcome, state: { ...state, revision: current.revision + 1 } });
}

function asset(request, pathname) {
  const name = pathname === "/" ? "index.html" : pathname.slice(1);
  if (!Object.hasOwn(bundledAssets, name)) return new Response("Not found", { status: 404, headers: securityHeaders });
  if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405 });
  const { bytes, etag } = bundledAssets[name];
  const kind = name.split(".").at(-1);
  const headers = new Headers({
    ...securityHeaders,
    "Content-Type": mimeTypes[kind] || "application/octet-stream",
    "Cache-Control": kind === "html" ? "private, no-store" : "private, max-age=3600",
    ETag: etag
  });
  if (request.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers });
  let data = decodedAssets.get(name);
  if (!data) {
    const raw = atob(bytes);
    data = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index++) data[index] = raw.charCodeAt(index);
    decodedAssets.set(name, data);
  }
  const range = request.headers.get("Range");
  if (kind === "mp3") {
    headers.set("Accept-Ranges", "bytes");
    if (range && request.method === "GET") {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : Math.max(0, data.length - Number(match?.[2]));
      const end = match?.[1] && match[2] ? Math.min(data.length - 1, Number(match[2])) : data.length - 1;
      if (!match || start > end) {
        headers.set("Content-Range", "bytes */" + data.length);
        return new Response(null, { status: 416, headers });
      }
      headers.set("Content-Range", `bytes ${start}-${end}/${data.length}`);
      return new Response(data.subarray(start, end + 1), { status: 206, headers });
    }
  }
  headers.set("Content-Length", String(data.length));
  return new Response(request.method === "HEAD" ? null : data, { headers });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path !== "/api/game") return asset(request, path);
    try {
      return await game(request, env);
    } catch {
      return json({ error: "unavailable" }, 503);
    }
  }
};
