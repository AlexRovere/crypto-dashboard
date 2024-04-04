<template>
  <div class="column gap-md">
    <div class="row">
      <q-space />
      <q-btn @click="cryptoDialog = true" color="positive">Ajouter une crypto</q-btn>
    </div>

    <div class="row">

      <div class="column col">
        <div class="row gap-md">
          <h6>Toutes les cryptos</h6>
          <q-btn flat round dense icon="refresh" @click="fetchAllCryptos"></q-btn>
        </div>

        <div class="row  gap-md items-center">
          <template v-if="allCryptos && allCryptos.length > 0" v-for="item of allCryptos" :key="item.id">
            <q-card>
              <q-card-section>
                {{ item.name }} ( {{ item.symbol }} ) #{{ item.rank }}
              </q-card-section>

              <q-card-section>
                Market cap : {{ item.marketCap.toFixed(2) }} $
              </q-card-section>

              <q-card-section>
                Change 24h : <span :style="{ color: item.change24h > 0 ? 'green' : 'red' }"> {{ item.change24h.toFixed(2) }} % </span>
              </q-card-section>

              <q-card-section>
                Valeur : {{ item.price.toFixed(2) }} $
              </q-card-section>
            </q-card>

          </template>
        </div>
      </div>

      <div class="column self-start col-4 gap-md items-center">
        <h6>Mes cryptos</h6>
        <template v-if="userCryptos && userCryptos.length > 0" v-for="item of userCryptos" :key="item.id">
          <q-card>
            <q-card-section>
              {{ item.name }}
            </q-card-section>

            <q-card-section>
              {{ item.quantity }}
            </q-card-section>
          </q-card>
        </template>
      </div>
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


const userCryptos = ref([])
const allCryptos = ref([])

const fetchAllCryptos = async () => {
  try {
    await useFetch('https://api.coincap.io/v2/assets', {
      onResponse ({ response }) {
        console.log(response?._data?.data)
        allCryptos.value = response?._data?.data.map((item) => {
          return {
            rank: item.rank,
            name: item.name,
            symbol: item.symbol,
            price: +item.priceUsd,
            marketCap: +item.marketCapUsd,
            change24h: +item.changePercent24Hr
          }
        })
      }
    })

  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  try {
    fetchAllCryptos()
    fetchUserCrypto()

    client.subscribe(`databases.${config.public.database_crypto}.collections.${config.public.collection_crypto}.documents`, response => {
      fetchUserCrypto()
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


const fetchUserCrypto = async () => {
  try {
    const response = await DB.listDocuments(
      '66058142ae7ac2bc3864',
      '6605814b299b37157300'
    )
    userCryptos.value = response?.documents
  }
  catch (e) {
    console.error(e)
  }
}


const saveCrypto = async () => {
  console.log('save crypto')
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
}

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