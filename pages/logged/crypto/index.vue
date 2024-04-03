<template>
  <div class="column gap-md">
    <div class="row">
      <q-space />
      <q-btn @click="cryptoDialog = true" color="positive">Ajouter une crypto</q-btn>
    </div>
    <div class="row gap-md items-center">
      <template v-if="cryptosList" v-for="item of cryptosList" :key="item.id">
        ID : {{ item.id }}
        Nom : {{ item.name }}
        Symbole : {{ item.symbol }}
      </template>
    </div>
    <q-dialog v-model="cryptoDialog">
      <q-card style="width: 50vw">
        <!-- HEADER -->
        <q-card-section class="row items-center">
          Nouvelle crypto
          <q-space />
          <q-btn @click="cryptoDialog = false" icon="close" dense outlined flat round />
        </q-card-section>

        <!-- BODY -->
        <q-card-section class="column gap-md">

          <div class="row items-center gap-md">

            <!-- NAME -->
            <q-input v-model="card.name" label="Nom" class="col" outlined dense />

            <!-- COST -->
            <q-input v-model="card.cost" label="Coût" class="col" outlined dense />
          </div>

        </q-card-section>

        <!-- FOOTER -->
        <q-card-section class="row items-centers">
          <q-btn @click="cryptoDialog = false">Annuler</q-btn>
          <q-space />
          <q-btn @click="saveCrypto" color="positive">Sauvegarder</q-btn>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { DB, client } from '~/utils/appwrite.js';
import { useQuasar } from 'quasar'

const $q = useQuasar()

const cryptoDialog = ref(false)

const defaultCard = {
  name: '',
  cost: '',
  colors: [],
  type: '',
  expansion: '',
  skills: [],
  description: '',
  attack: '',
  endurance: '',
}

const defaultCardData = {
  name: 'nom',
  cost: 'cost',
  colors: ['R', 'B'],
  type: 'type',
  expansion: 'expansion',
  skills: ['fly'],
  description: 'description',
  attack: 'attack',
  endurance: 'endurance',
}

const config = useRuntimeConfig()


const cards = ref([])
const cryptosList = ref([])

onMounted(async () => {
  cryptosList.value = await useFetch('https://api.coingecko.com/api/v3/coins/list')?.data
  console.log(cryptosList.value)
  fetchCrypto()

  try {
    client.subscribe(`databases.${config.public.database_crypto}.collections.${config.public.collection_crypto}.documents`, response => {
      // Callback will be executed on changes for documents A and all files.
      fetchCrypto()

    })
  } catch (e) {
    console.error(e)
  }

})

const card = reactive({ ...defaultCardData })

const file = ref(null)

const removeChip = (chip) => {
  const idx = card.colors.findIndex(c => c.value === chip.value)
  card.colors.splice(idx, 1)
}


// const fetchCrypto = async () => {
//   try {
//     const response = await DB.listDocuments(
//       '655e0d807da8e3dce780',
//       '655e0d89c8ee2375cf8f'
//     )
//     cards.value = response?.documents
//   }
//   catch (e) {
//     console.error(e)
//   }
// }


// const saveCrypto = async () => {
//   try {
//     if (file.value) {
//       const fileId = uid()
//       card.fileId = fileId
//       await storage.createFile(
//         '651bed78e21021ee0a4f',
//         fileId,
//         file.value
//       )
//     }

//     $q.loading.show()
//     await DB.createDocument(
//       '655e0d807da8e3dce780',
//       '655e0d89c8ee2375cf8f',
//       ID.unique(),
//       card
//     )
//     $q.notify({ message: 'Carte enregistré avec succès', color: 'positive' })
//     cryptoDialog.value = false
//   } catch (e) {
//     $q.notify({ message: 'Erreur lors de la création', color: 'negative' })
//     console.error(e)
//   } finally {
//     $q.loading.hide()
//   }
// }

const editCrypto = _card => {
  Object.assign(card, _card)
  cryptoDialog.value = true
}

const deleteCrypto = async (card) => {
  try {
    $q.loading.show()
    await DB.deleteDocument(
      '655e0d807da8e3dce780',
      '655e0d89c8ee2375cf8f',
      card.$id
    )
    $q.notify({ message: 'Carte supprimée avec succès', color: 'positive' })
  } catch (e) {
    $q.notify({ message: 'Erreur lors de la suppression', color: 'negative' })
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

watch(cryptoDialog, val => {
  if (!val) {
    Object.assign(card, defaultCard)
    file.value = null
  }
})



</script>


<style scoped></style>