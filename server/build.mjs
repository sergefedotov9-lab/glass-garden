import { readFile, writeFile, mkdir, cp, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const files = (await readdir(dist, { withFileTypes: true })).filter(entry => entry.isFile());
const assets = Object.fromEntries(await Promise.all(files.map(async ({ name }) => {
  const data = await readFile(new URL(name, dist));
  return [name, {
    bytes: data.toString("base64"),
    etag: '"' + createHash("sha256").update(data).digest("hex").slice(0, 20) + '"'
  }];
})));
await mkdir(new URL("server/", dist), { recursive: true });
await mkdir(new URL(".openai/", dist), { recursive: true });
await cp(new URL(".openai/hosting.json", root), new URL(".openai/hosting.json", dist));
await cp(new URL("drizzle/", root), new URL(".openai/drizzle/", dist), { recursive: true });
await writeFile(new URL("server/index.js", dist), [
  "const bundledAssets = " + JSON.stringify(assets) + ";",
  await readFile(new URL("engine.js", dist), "utf8"),
  await readFile(new URL("worker.js", import.meta.url), "utf8")
].join("\n"));
