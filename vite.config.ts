
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add Buffer polyfill for SUI SDK browser compatibility
      buffer: "buffer",
    },
  },
  define: {
    // Required for SUI SDK
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["buffer"],
  },
}));
