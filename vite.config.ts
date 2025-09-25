import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    sentryVitePlugin({
      org: "goldencodex",
      project: "cms-vue-project",
    }),
  ],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/tunnel": {
        target:
          "https://a6688f9df02441a82e9565663a51bcf9@o4510065465163776.ingest.de.sentry.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/tunnel/, "/api/4510065484431440/envelope/"),
      },
    },
  },
  preview: {
    proxy: {
      "/tunnel": {
        target:
          "https://a6688f9df02441a82e9565663a51bcf9@o4510065465163776.ingest.de.sentry.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/tunnel/, "/api/4510065484431440/envelope/"),
      },
    },
  },

  build: {
    sourcemap: true,
  },
});
