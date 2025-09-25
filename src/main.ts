import { createApp } from "vue";
import "./style.css";
import "primeicons/primeicons.css";
import App from "./App.vue";
import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import router from "./router/router";
import { ToastService } from "primevue";
import pinia from "./store";
import { definePreset } from "@primeuix/themes";
import * as Sentry from "@sentry/vue";

const MyPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        surface: {
          0: "#f7f7f7",
          50: "#c6f6d5",
          100: "#86efac",
          200: "#bbf7d0",
          300: "{zinc.300}",
          400: "{zinc.400}",
          500: "{zinc.500}",
          600: "{zinc.600}",
          700: "{zinc.700}",
          800: "{zinc.800}",
          900: "{zinc.900}",
          950: "{zinc.950}",

          primary: "#f3f1ef",
        },
      },
      dark: {
        surface: {
          primary: "{zinc.900}",
        },
      },
    },
  },
  components: {
    datatable: {
      colorScheme: {
        light: {
          row: {
            hoverBackground: "#c6f6d5",
            selectedBackground: "#86efac",
            stripedBackground: "#e8ecf0",
            selectedColor: "black",
          },
        },

        dark: {
          headerCell: {
            hoverBackground: "#064e3b",
          },
          row: {
            hoverBackground: "#064e3b",
            selectedBackground: "#14543c94",
            stripedBackground: "#14543c94",
            selectedColor: "white",
          },
        },
      },
    },

    paginator: {
      colorScheme: {
        light: {
          navButton: {
            hoverBackground: "#c6f6d5",
            selectedBackground: "#86efac",
          },
        },
        dark: {
          navButton: {
            hoverBackground: "#064e3b",
            selectedBackground: "#14543c94",
          },
        },
      },
    },

    inputtext: {
      colorScheme: {
        light: {
          root: {
            background: "#fefcf9",
          },
        },
        dark: {
          root: {
            background: "#09090b",
          },
        },
      },
    },
  },
});
const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://a6688f9df02441a82e9565663a51bcf9@o4510065465163776.ingest.de.sentry.io/4510065484431440",
  tunnel: "/tunnel",
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    "localhost",
    "https://cms-vue-project.vercel.app",
    "https://dev-cms-vue-project.vercel.app",
  ],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
});

app.use(router);

app.use(ToastService);

app.use(pinia);

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,

    options: {
      darkModeSelector: ".my-app-dark",
    },
  },
});

app.mount("#app");

Sentry.addIntegration(Sentry.vueIntegration({ app }));
