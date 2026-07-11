import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Served from https://ankit-2910.github.io/neostream/ — assets need the subpath
  base: process.env.GHPAGES ? "/neostream/" : "/",
  server: { port: 5173 },
});
