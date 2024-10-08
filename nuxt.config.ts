// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
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
      protectedUrls: ["/jeopardy", "/musicquiz", "/wizard"],
    },
  },
  ui: {
    disableGlobalStyles: true,
  },
});
