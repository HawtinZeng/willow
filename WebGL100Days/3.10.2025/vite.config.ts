import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import sourcemaps from "rollup-plugin-sourcemaps";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [sourcemaps() as any],
    },
  },
});
