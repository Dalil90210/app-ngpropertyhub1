// Post-build: emit a Vercel Build Output API v3 directory from
// `dist/client` (static) + `dist/server` (SSR edge function).
// Runs after `vite build --config vite.config.vercel.ts`.
import { rm, mkdir, cp, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, ".vercel", "output");
const staticDir = path.join(out, "static");
const fnDir = path.join(out, "functions", "index.func");

if (!existsSync(path.join(root, "dist/client"))) {
  console.error("dist/client missing — run vite build first.");
  process.exit(1);
}
if (!existsSync(path.join(root, "dist/server"))) {
  console.error("dist/server missing — run vite build first.");
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(staticDir, { recursive: true });
await mkdir(fnDir, { recursive: true });

// 1) Copy client assets into static/
await cp(path.join(root, "dist/client"), staticDir, { recursive: true });

// 2) Copy server bundle into the function directory
await cp(path.join(root, "dist/server"), fnDir, { recursive: true });

// 3) Edge function entry: adapt the Cloudflare-style {fetch} export
//    (dist/server/server.js) to the Vercel Edge runtime signature.
await writeFile(
  path.join(fnDir, "entry.mjs"),
  `import server from "./server.js";
export default (request, context) => server.fetch(request, {}, context);
`,
);

await writeFile(
  path.join(fnDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "edge",
      entrypoint: "entry.mjs",
    },
    null,
    2,
  ),
);

// 4) Top-level config — serve files from static/, fall back to the SSR function.
await writeFile(
  path.join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("Vercel Build Output written to .vercel/output");
