// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],
  quasar: {
    plugins: [
      'Notify',
      'Loading'
    ]
  },
  runtimeConfig: {
    public: {
      database_test: process.env.APPWRITE_DATABASE_TEST_ID,
      collection_magic: process.env.APPWRITE_COLLECTION_MAGIC_ID
    }
  }
})
