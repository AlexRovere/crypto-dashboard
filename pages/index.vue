<template>
  <q-form @submit="sendForm" class="col flex-center column">

    <q-card class="column gap-md q-pa-lg" style="width: 30vw;  aspect-ratio: 1/1;">

      <div class="row justify-center">
        <q-btn-toggle dense v-model="type" :options="[{ label: 'Créer un compte', value: 'registering' }, { label: 'Se connecter', value: 'connexion' }]"></q-btn-toggle>
      </div>

      <!-- EMAIL -->
      <q-input v-model="email" type="email" placeholder="Email" :hint="type === 'registering' ? 'john.doe@gmail.com' : 'alex.rovere@hotmail.fr'"
        outlined counter lazy-rules required
        :rules="[
          val => !!val || 'Champ requis',
          val => rulesEmail(val)
        ]" />

      <!-- PASSWORD -->
      <q-input v-model="password" type="password" min="8" placeholder="Password" :hint="type === 'registering' ? 'supermdpdelamortù&dj959548' : 'supermdpdelamortù&dj959548'"
        outlined lazy-rules counter required
        :rules="[
          val => !!val || 'Champ requis',
          val => val.length >= 8 || '8 caractères minimum',
        ]" />

      <!-- NAME -->
      <q-input v-if="type === 'registering'" v-model="name" type="text" placeholder="Name" hint="JDOE"
        outlined lazy-rules counter required
        :rules="[
          val => !!val || 'Champ requis',
          val => val.length >= 4 || '4 caractères minimum'
        ]" />

      <q-space />
      <div class="row gap-sm">
        <q-space />
        <q-btn v-if="type === 'registering'" dense color="blue" type="submit">
          Créer votre compte
        </q-btn>
        <q-btn v-else dense color="positive" type="submit">Connexion</q-btn>

      </div>
    </q-card>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router'
import { account, ID } from '~/utils/appwrite.js';
import { useMainStore } from '~/stores/main.js';
import { useQuasar } from 'quasar'

const $q = useQuasar()
const $router = useRouter()
const email = ref('');
const password = ref('');
const name = ref('');
const mainStore = useMainStore()
const type = ref('connexion')

const sendForm = async () => {
  try {
    $q.loading.show()
    if (type.value === 'registering') await register()
    else await login(email.value, password.value)
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const login = async (email, password) => {
  await account.createEmailSession(email, password)
  try {
    mainStore.user = await account.get();
  } catch (e) {
    console.error(e)
  }

};

const register = async () => {
  await account.create(ID.unique(), email.value, password.value, name.value);
  login(email.value, password.value);
};

const rulesEmail = (val) => {
  if (!val) return false
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (val.match(mailformat)) {
    return true
  }
  return 'Email non valide';
}

watch(() => mainStore.user, val => {
  if (val) $router.push({ name: 'logged' })
}, { immediate: true })
</script>