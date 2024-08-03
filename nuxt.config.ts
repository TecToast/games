// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt',],
  routeRules: {
    "/api/**": {
      proxy: {
        to: "http://localhost:9934/api/**",
        fetchOptions: {
          redirect: "manual",
          credentials: "include"
        }
      }
    },
    "/upload": {
      proxy: {
        to: "http://localhost:8080/upload",
        fetchOptions: {
          redirect: "manual",
          credentials: "include"
        }
      }
    }
  },
})
