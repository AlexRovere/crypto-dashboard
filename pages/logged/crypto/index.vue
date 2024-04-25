<template>
  <div class="column gap-md">
    <div class="row gap-md items-center">

      <q-tabs no-caps v-model="tab">
        <q-tab name="allCryptos">Toutes les cryptos</q-tab>
        <q-tab name="myCryptos">Mes cryptos</q-tab>
      </q-tabs>

      <q-space />
      <q-select dense outlined :options="currencyOpt" v-model="currency" />
      <q-btn @click="cryptoDialog = true" color="positive">Ajouter une crypto</q-btn>
    </div>

    <q-tab-panels v-model="tab">

      <q-tab-panel name="allCryptos">
        <div class="row gap-md items-center">
          <div class="text-h6">Toutes les cryptos</div>
          <q-btn flat round dense icon="refresh" @click="fetchAllCryptos"></q-btn>
          <q-space />
          <q-input dense outlined clearable v-model="search" />
        </div>

        <div class="row gap-md items-center">
          <template v-if="allCryptosFiltered && allCryptosFiltered.length > 0" v-for="item of allCryptosFiltered" :key="item.id">
            <q-card class="col-3" square>
              <q-card-section class="row items-center gap-md">
                <div>
                  <img width="40" :src="`https://assets.coincap.io/assets/icons/${item.id.toLowerCase()}@2x.png`" />
                  {{ item.name }} ( {{ item.id }} ) #{{ item.rank }}
                </div>
                <q-space />
                <div>
                  <q-icon v-if="isCryptoActive(item.id)" name="star" size="sm" color="yellow" @click="disableCrypto(item.id)" />
                  <q-icon v-else name=" star" size="sm" @click=" activateCrypto(item.id, item.name)" />
                </div>
              </q-card-section>

              <q-card-section>
                Market cap : {{ item.marketCap.toFixed(2) }} {{ currency.label }}
              </q-card-section>

              <q-card-section>
                Change 24h : <span :style="{ color: isPositive(item.change24h) ? 'green' : 'red' }">
                  <q-icon :name="isPositive(item.change24h) ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'" />
                  {{ item.change24h.toFixed(2) }} % </span>
              </q-card-section>

              <q-card-section>
                Valeur : {{ item.price.toFixed(2) }} {{ currency.label }}
              </q-card-section>
            </q-card>

          </template>
        </div>
      </q-tab-panel>

      <q-tab-panel name="myCryptos">

        <div class="row gap-md">
          <div class="text-h6">Mes cryptos</div>
          <q-btn flat round dense icon="refresh" @click="fetchDb"></q-btn>
          <q-space />
          <q-input dense outlined clearable v-model="search" />

        </div>

        <div class="row gap-md items-center">

          <template v-if="userCryptos && userCryptos.length > 0" v-for="item of userCryptosFiltered" :key="item.id">
            <q-card class="col-3">
              <q-card-section class="row items-center">
                <div class="row items-center gap-md">
                  <img width="40" :src="`https://assets.coincap.io/assets/icons/${item.$id.toLowerCase()}@2x.png`" />
                  {{ item.name }} ( {{ item.$id }} )
                </div>
                <q-space />
                <q-icon name="add" size="sm" />
                <q-icon name="more_vert" size="sm" />
              </q-card-section>


              <q-card-section>
                Quantité : {{ cryptoQuantity(item.$id) }}
              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Prix d'achat moyen : {{ cryptoAveragePrice(item.$id) }} {{ currency.label }}

              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Total investi : {{ cryptoInvest(item.$id) }} {{ currency.label }}

              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Total Actuel : {{ cryptoTotal(item.$id) }} {{ currency.label }}

              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Profit :
                <span :style="{ color: isPositive(cryptoProfit(item.$id)) ? 'green' : 'red' }">
                  <q-icon :name="isPositive(cryptoProfit(item.$id)) ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'" />
                  {{ cryptoProfit(item.$id) }} %</span>
              </q-card-section>

            </q-card>
          </template>
        </div>
      </q-tab-panel>


    </q-tab-panels>




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
            <q-select v-model="crypto" :options="allCryptosOptions" map-options label="Nom" class="col" outlined dense />
            <!-- <q-input v-model="card.name" label="Nom" class="col" outlined dense /> -->

          </div>

        </q-card-section>

        <!-- FOOTER -->
        <q-card-section class="row items-centers">
          <q-btn @click="cryptoDialog = false">Annuler</q-btn>
          <q-space />
          <q-btn @click="activateCrypto(crypto.value, crypto.label)" color="positive">Sauvegarder</q-btn>
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

const tab = ref('myCyptos')

const crypto = ref('')


const userCryptos = ref([])
const transactions = ref([])
const allCryptos = ref([])

const allCryptosOptions = computed(() => {
  return allCryptos.value.length ? allCryptos.value.map(el => {
    return {
      label: el.name,
      value: el.id
    }
  }).filter(c => !userCryptos.value.some(uc => uc.$id === c.value)) : []
})

const allCryptosFiltered = computed(() => {
  return search.value ? allCryptos.value.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase()) || a.id.toLowerCase().includes(search.value.toLowerCase())) : allCryptos.value
})

const userCryptosFiltered = computed(() => {
  return search.value ? userCryptosFiltered.value.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase()) || a.$id.toLowerCase().includes(search.value.toLowerCase())) : userCryptos.value
})

const search = ref('')

const currency = ref({
  label: '$',
  value: 1
})

const currencyOpt = [
  {
    label: '$',
    value: 1
  },
  {
    label: '€',
    value: 1.0855
  }
]

const fetchAllCryptos = async () => {
  try {
    await useFetch('https://api.coincap.io/v2/assets', {
      onResponse ({ response }) {
        allCryptos.value = response?._data?.data.map((item) => {
          return {
            id: item.symbol,
            rank: item.rank,
            name: item.name,
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
    if ($q.localStorage.has('currency')) currency.value = $q.localStorage.getItem('currency')
    if ($q.localStorage.has('tab')) tab.value = $q.localStorage.getItem('tab')

    fetchAllCryptos()
    fetchDb()

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

const fetchDb = () => {
  fetchUserCrypto()
  fetchTransactions()
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

const fetchTransactions = async () => {
  try {
    const response = await DB.listDocuments(
      '66058142ae7ac2bc3864',
      '660fb13c51fb6f87af02'
    )
    transactions.value = response?.documents
  }
  catch (e) {
    console.error(e)
  }
}


const saveCrypto = async () => {
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

const activateCrypto = async (id, name) => {
  try {
    const data = {
      name
    }
    $q.loading.show()
    await DB.createDocument(
      '66058142ae7ac2bc3864',
      '6605814b299b37157300',
      id,
      data
    )
  } catch (e) {
    console.error(e)
  } finally {
    cryptoDialog.value = false
    $q.loading.hide()
  }
}

const disableCrypto = async id => {
  try {
    $q.loading.show()
    await DB.deleteDocument(
      '66058142ae7ac2bc3864',
      '6605814b299b37157300',
      id
    )
  } catch (e) {
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

const isPositive = number => {
  if (number >= 0) return true
  return false
}

const cryptoQuantity = id => {
  return transactions.value.filter(t => {
    return t.cryptos?.$id === id
  }).reduce((acc, curr) => {
    return acc + curr.quantity
  }, 0).toFixed(2)
}

const cryptoAveragePrice = id => {
  let quantity = 0
  return ((transactions.value.filter(t => {
    return t.cryptos?.$id === id
  }).reduce((acc, curr) => {
    quantity += curr.quantity
    return acc + curr.price
  }, 0) / quantity) * currency.value.value).toFixed(2)
}

const cryptoInvest = id => {
  return (cryptoQuantity(id) * cryptoAveragePrice(id)).toFixed(2)
}

const cryptoTotal = id => {
  if (allCryptos.value && allCryptos.value.length > 0) {
    const currentPrice = allCryptos.value.find(c => c.id === id).price
    return (currentPrice * currency.value.value * cryptoQuantity(id)).toFixed(2)
  }
  return 'N/A'
}

const cryptoProfit = id => {
  return ((cryptoTotal(id) - cryptoInvest(id)) / cryptoInvest(id) * 100).toFixed(2)
}

const isCryptoActive = id => {
  return userCryptos.value.some(c => c.$id === id)
}

watch(currency, val => {
  $q.localStorage.set('currency', val)
})

watch(tab, val => {
  $q.localStorage.set('tab', val)
})



</script>


<style scoped></style>