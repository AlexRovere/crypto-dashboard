<template>
  <h4>Contactez-nous</h4>

  <div class="row col">

    <q-form @submit="sendContact" class="column col gap-md">

      <div class="row items-center gap-md">
        <!-- NOM -->
        <div class="col">
          <div class="form-label">Nom</div>
          <q-input v-model="form.name" placeholder="Votre nom" required rounded outlined />
        </div>

        <!-- EMAIL -->
        <div class="col">
          <div class="form-label">Email</div>
          <q-input v-model="form.email" placeholder="Votre adresse email" required rounded outlined />
        </div>
      </div>

      <div class="row items-center gap-md">
        <!-- COMPANY -->
        <div class="col">
          <div class="form-label">Société</div>
          <q-input v-model="form.company" placeholder="Nom de votre société" hint="Facultatif." rounded outlined />
        </div>

        <!-- PHONE -->
        <div class="col">
          <div class="form-label">Téléphone</div>
          <q-input v-model="form.phone" placeholder="Votre numéro de téléphone" hint="Facultatif." rounded outlined />
        </div>
      </div>

      <!-- MESSAGE -->
      <div>
        <div class="form-label">Message</div>
        <q-input type="textarea" v-model="form.message" placeholder="Votre message" rounded outlined />
      </div>

      <q-btn v-if="!serverResponse" type="submit" class="form-btn">
        ENVOYER MON MESSAGE
      </q-btn>

      <div v-else>
        Votre message a bien été envoyé !
      </div>

      {{ serverResponse }}

    </q-form>
    <div class="col-5 bg-img">

    </div>
  </div>
</template>
<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()
const form = reactive({})
const serverResponse = ref()
const sendContact = async () => {
  try {
    const response = await useFetch('/api/contact', {
      method: 'post',
      body: form
    })
    serverResponse.value = response.data
    const name = response?.data?.name || ''
    $q.notify({ message: `Formulaire envoyé, merci ${name}`, color: 'positive' })
  } catch (e) {
    console.error(e)
  }
}
</script>
<style scoped>
.bg-img {
  background: url("@/assets/img/contact-form-arrows.webp");
  background-size: contain;
  background-position: top;
  background-repeat: no-repeat;
}

.form-label {
  margin-bottom: 10px;
  font-size: 1.5rem;
  margin-left: 10px;
}

.form-btn {
  color: white;
  padding: 9px 24px 11px 24px;
  background-color: #F69F4F;
  border-radius: 41px;
  text-transform: uppercase;
  font-weight: 500;
  border: none;
  font-size: 21px;
}
</style>