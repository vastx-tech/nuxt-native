export default defineNuxtConfig({
  modules: ['nuxt-native'],
  compatibilityDate: '2026-09-23',

  native: {
    appId: "com.example.referenceapp",
    appName: "Nuxt Native Reference",
    theme: { background: "#F8FAFC", primary: "#4F46E5" }
  }
})
