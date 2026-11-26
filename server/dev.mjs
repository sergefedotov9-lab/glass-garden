import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { Readable } from "node:stream";

await import("./build.mjs");
const worker = (await import("../dist/server/index.js")).default;
const database = new DatabaseSync(":memory:");
database.exec(readFileSync(new URL("../drizzle/0000_garden.sql", import.meta.url), "utf8"));
const DB = {
  prepare(sql) {
    const statement = database.prepare(sql);
    return { bind(...args) {
      return {
        async first() { return statement.get(...args); },
        async run() { return { meta: statement.run(...args) }; }
      };
    } };
  }
};
const flags = process.argv.slice(2);
const port = Number(flags[flags.indexOf("--port") + 1]) || Number(process.env.PORT) || 4173;
createServer(async (incoming, outgoing) => {
  const headers = new Headers(incoming.headers);
  headers.delete("oai-authenticated-user-id");
  headers.set("oai-authenticated-user-email", "local-preview-player@example.test");
  const options = { method: incoming.method, headers };
  if (incoming.method !== "GET" && incoming.method !== "HEAD") {
    options.body = Readable.toWeb(incoming);
    options.duplex = "half";
  }
  try {
    const result = await worker.fetch(new Request("http://" + incoming.headers.host + incoming.url, options), { DB });
    outgoing.writeHead(result.status, Object.fromEntries(result.headers));
    if (result.body) Readable.fromWeb(result.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    outgoing.writeHead(500).end();
  }
}).listen(port, process.env.HOST || "127.0.0.1", () => console.log(`Preview on port ${port}`));
