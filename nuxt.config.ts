// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: [
      'Notify',
      'Loading',
      'LocalStorage'
    ]
  },
  runtimeConfig: {
    public: {
      database_crypto: process.env.APPWRITE_DATABASE_CRYPTO_ID,
      collection_crypto: process.env.APPWRITE_COLLECTION_CRYPTO_ID
    }
  }
})
