import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// `base` must match the GitHub Pages path when deploying to
// https://<user>.github.io/<repo>/. The workflow sets GH_PAGES=true so dev/prod
// builds from Lovable still serve from root.
const base = process.env.GH_PAGES === "true" ? "/villa-haven-core/" : "/";

export default defineConfig(({ mode }) => ({
  base,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
