import dotenv from "dotenv";
const isDev = process.env.NODE_ENV === "development";
const envFile = isDev ? ".env.development" : ".env.production";
console.log("환경파일", envFile);

dotenv.config({ path: envFile });

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["vuetify-nuxt-module", "@pinia/nuxt"],
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      theme: {
        defaultTheme: "light",
      },
      icons: {
        defaultSet: "mdi",
      },
    },
  },

  css: ["@mdi/font/css/materialdesignicons.min.css"],
  runtimeConfig: {
    // SSR에서만 접근 가능 (서버 사이드 전용)
    apiBaseServer:
      process.env.NUXT_API_BASE_SERVER || process.env.NUXT_PUBLIC_API_BASE,

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },
});
