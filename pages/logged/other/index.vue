<template>
  <div>
    c'est other
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '~/stores/main';
const mainStore = useMainStore()
const $router = useRouter()
const user = computed(() => mainStore.user)

</script>
