// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/scripts",
    "nuxt-auth-utils",
    "nuxt-file-storage",
  ],
  app: {
    head: {
      htmlAttrs: {
        style: "background-color: #36393f",
      },
    },
  },
  runtimeConfig: {
    public: {
      protectedUrls: ["/jeopardy", "/wizard", "/nobodyisperfect"],
      userdataRequired: ["/jeopardy", "/nobodyisperfect"],
      wizardYT: false,
      host: "",
    },
    oauth: {
      discord: {
        clientId: "",
        clientSecret: "",
      },
    },
    mongodb: "",
    discord: {
      token: "",
      guild: "",
    },
    redis: {
      host: "localhost",
      port: 6379,
    },
    media: {
      base: "./media",
    },
    cards: {
      wizard: "./cards/wizard",
    },
    session: {
      maxAge: 60 * 60 * 24 * 7,
      password: "",
    },
  },
  ui: {
    disableGlobalStyles: true,
  },
  tailwindcss: {
    config: {
      safelist: [
        "border-red-400",
        "border-yellow-400",
        "border-green-400",
        "border-blue-400",
      ],
      darkMode: "selector",
    },
  },
  colorMode: {
    preference: "dark",
  },
  imports: {
    dirs: ["./stores", "./composables/wizard"],
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
});
