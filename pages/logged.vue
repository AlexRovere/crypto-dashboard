<template>
  <div>
    Connecté en tant que {{ user?.name }}

    <q-tabs>
      <q-route-tab
        label="crypto"
        icon="list"
        to="/logged/crypto" />
      <!-- <q-route-tab
        label="Trello"
        icon="tasks"
        to="/logged/trello" /> -->
    </q-tabs>

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
  if (!val) $router.push({ name: 'login' })
}, { immediate: true })
</script>
