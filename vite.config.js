// Two pages: the room catalog (index.html) and the Practice 12 single-room checker (availability.html).
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        availability: resolve(import.meta.dirname, "availability.html"),
      },
    },
  },
});
