import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Custom domain https://neostream.shivanchal.in serves from the root.
  base: "/",
  server: { port: 5173 },
});
