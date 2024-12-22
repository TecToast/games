// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxt/ui", "@nuxtjs/tailwindcss", "@pinia/nuxt", "@vueuse/nuxt"],
  app: {
    head: {
      htmlAttrs: {
        style: "background-color: #36393f",
      },
    },
  },
  routeRules: {
    "/api/**": {
      proxy: {
        to: "http://localhost:9934/api/**",
        fetchOptions: {
          redirect: "manual",
          credentials: "include",
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      protectedUrls: ["/jeopardy", "/musicquiz", "/wizard", "/nobodyisperfect"],
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
    },
  },
  colorMode: {
    preference: "dark",
  },
});
