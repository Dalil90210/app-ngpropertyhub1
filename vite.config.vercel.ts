// Vercel-only Vite config. Does NOT use @lovable.dev/vite-tanstack-config
// (which bundles the Cloudflare Workers plugin). Run with:
//   vite build --config vite.config.vercel.ts
// Vercel auto-detects this via the `buildCommand` in vercel.json.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      target: "vercel",
      // Use the default TanStack Start server entry on Vercel — our custom
      // src/server.ts is shaped for the Cloudflare Workers fetch handler.
    }),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
});
