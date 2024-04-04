<template>
  <div>
    Connecté en tant que {{ user?.name }}
    <NuxtPage class="col column" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '~/stores/main'

const mainStore = useMainStore()
const $router = useRouter()
const user = computed(() => mainStore.user)

watch(user, val => {
  if (!val) $router.push({ name: 'index' })
  else $router.push({ name: 'logged-crypto' })
}, { immediate: true })
</script>
