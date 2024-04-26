<template>
  <div class="column gap-md">
    <div class="row gap-md items-center">

      <q-tabs no-caps v-model="cryptoTab">
        <q-tab name="allCryptos">Toutes les cryptos</q-tab>
        <q-tab name="myCryptos">Mes cryptos</q-tab>
      </q-tabs>

      <q-space />
      <q-select dense outlined :options="currencyOpt" v-model="currency" />
      <q-btn @click="cryptoDialog = true" color="positive">Ajouter une crypto</q-btn>
    </div>

    <q-tab-panels v-model="cryptoTab">

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
                Market cap : {{ (item.marketCap * currency.value).toFixed(2) }} {{ currency.label }}
              </q-card-section>

              <q-card-section>
                Change 24h : <span :style="{ color: isPositive(item.change24h) ? 'green' : 'red' }">
                  <q-icon :name="isPositive(item.change24h) ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'" />
                  {{ item.change24h.toFixed(2) }} % </span>
              </q-card-section>

              <q-card-section>
                Valeur : {{ (item.price * currency.value).toFixed(2) }} {{ currency.label }}
              </q-card-section>
            </q-card>

          </template>
        </div>
      </q-tab-panel>

      <q-tab-panel class="gap-md column" name="myCryptos">

        <div class="row gap-md items-center">
          <div class="row gap-md justify-start">
            <div class="text-h6">Mes cryptos</div>
            <q-btn flat round dense icon="refresh" @click="fetchDb"></q-btn>
          </div>
          <q-card class="q-pa-md">
            <div class="row items-center" :style="{ color: isPositive(totalProfit) ? 'green' : 'red' }">
              <q-icon size="md" :name="isPositive(totalProfit) ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'" />

              <span class="text-h6">
                {{ ((totalActual - totalInvest) * currency.value).toFixed(2) }} {{ currency.label }} <br /> {{ totalProfit }} %</span>
            </div>
            <div class="justify-center row">
              Balance
            </div>
          </q-card>

          <q-card class="q-pa-md self-stretch">
            {{ (totalInvest * currency.value).toFixed(2) }} {{ currency.label }}
            <div class="justify-center row">
              Investi
            </div>
          </q-card>

          <q-card class="q-pa-md self-stretch">
            {{ (totalActual * currency.value).toFixed(2) }} {{ currency.label }}
            <div class="justify-center row">
              Actuel
            </div>
          </q-card>
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
                <q-btn-dropdown flat dense dropdown-icon="more_vert">
                  <q-list>
                    <q-item clickable v-close-popup @click="openTransaction(item)">
                      <q-item-section>
                        <q-item-label>Ajouter une transaction</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="disableCrypto(item.$id)">
                      <q-item-section>
                        <q-item-label>Retirer la crypto</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openTransactionsHistory(item)">
                      <q-item-section>
                        <q-item-label>Voir l'historique des transactions</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-card-section>

              <q-card-section v-if="currentValue(item.$id)">
                Valeur du token : {{ currentValue(item.$id).toFixed(2) }} {{ currency.label }}
              </q-card-section>

              <q-card-section>
                Quantité : {{ cryptoQuantity(item.$id) }}
              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Prix d'achat moyen : {{ cryptoAveragePrice(item.$id) }} {{ currency.label }}

              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Investi : {{ cryptoInvest(item.$id) }} {{ currency.label }}

              </q-card-section>

              <q-card-section v-if="cryptoQuantity(item.$id) > 0">
                Actuel : {{ cryptoTotal(item.$id) }} {{ currency.label }}
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


    <!-- NEW CRYPTO DIALOG -->

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
            <q-select use-input hide-selected fill-input input-debounce="0" @filter="filterFn" v-model="newCrypto" :options="filteredCryptosOptions" map-options label="Nom" class="col" outlined dense />
          </div>
        </q-card-section>

        <!-- FOOTER -->
        <q-card-section class="row items-centers">
          <q-btn @click="cryptoDialog = false">Annuler</q-btn>
          <q-space />
          <q-btn @click="activateCrypto(newCrypto.value, newCrypto.label)" color="positive">Sauvegarder</q-btn>
        </q-card-section>

      </q-card>
    </q-dialog>

    <!-- TRANSACTION DIALOG -->

    <q-dialog v-model="transactionDialog">
      <q-card style="width: 50vw">

        <!-- HEADER -->
        <q-card-section class="row items-center">
          Nouvelle transaction
          <q-space />
          <q-btn @click="transactionDialog = false" icon="close" dense outlined flat round />
        </q-card-section>

        <q-tabs dense v-model="transactionTab">
          <q-tab name="buy" icon="payments" label="Achat" />
          <q-tab name="sell" icon="sell" label="Vente" />
        </q-tabs>

        <q-tab-panels v-model="transactionTab">

          <!-- BUY TRANSACTION -->
          <q-tab-panel name="buy">
            <q-card-section class="column gap-md">
              <q-select label="Crypto" dense outlined v-model="newTransaction.crypto" :options="userCryptosOptions" emit-value map-options />

              <div class="row gap-md items-center">
                <q-input label="Quantité" dense outlined class="col" type="number" min="0" :rules="[val => val > 0 || 'Doit être supérieur à 0']" v-model="newTransaction.quantity"></q-input>

                <q-input label="Prix par token" dense outlined class="col" type="number" min="0" :rules="[val => val > 0 || 'Doit être supérieur à 0']" v-model="newTransaction.coinPrice"></q-input>
              </div>

              <q-input label="Total dépensé" dense outlined readonly v-model="newTransaction.totalSpent"></q-input>

            </q-card-section>
          </q-tab-panel>

          <!-- SELL TRANSACTION -->
          <q-tab-panel name="sell">
            <q-card-section class="column gap-md">
              <q-select label="Crypto" dense outlined v-model="newTransaction.crypto" :options="userCryptosOptions" emit-value map-options />

              <div class="row gap-md items-center">
                <q-input label="Quantité" dense outlined class="col" type="number" min="0" :rules="[val => val > 0 || 'Doit être supérieur à 0']" v-model="newTransaction.quantity"></q-input>

                <q-input label="Prix par token" dense outlined class="col" type="number" min="0" :rules="[val => val > 0 || 'Doit être supérieur à 0']" v-model="newTransaction.coinPrice"></q-input>
              </div>

              <q-input label="Total reçu" dense outlined readonly v-model="newTransaction.totalReceived"></q-input>

            </q-card-section>
          </q-tab-panel>

        </q-tab-panels>

        <!-- FOOTER -->
        <q-card-section class="row items-centers">
          <q-btn @click="transactionDialog = false">Annuler</q-btn>
          <q-space />
          <q-btn @click="saveTransaction()" color="positive">Sauvegarder</q-btn>
        </q-card-section>

      </q-card>
    </q-dialog>

    <!-- TRANSACTION HISTORY DIALOG -->

    <q-dialog v-model="transcationHistoryDialog">
      <q-card style="width: 50vw">

        <!-- HEADER -->
        <q-card-section class="row items-center">
          Historiques des transactions de {{ transactionHistory.name }} ({{ transactionHistory.$id }})
          <q-space />
          <q-btn @click="transcationHistoryDialog = false" icon="close" dense outlined flat round />
        </q-card-section>

        <!-- BODY -->
        <q-card-section class="column gap-md">
          <q-table dense flat title="Historique" :rows="transactionHistoryList(transactionHistory.$id)" :columns="transactionsHistoryCols" row-key="id">
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn dense round flat color="negative" @click="deleteTransactionHistory(props.row)" icon="close" size="sm"></q-btn>
              </q-td>
            </template></q-table>
        </q-card-section>

        <!-- FOOTER -->
        <q-card-section class="row items-centers">
          <q-space />
          <q-btn flat dense v-close-popup>Fermer</q-btn>
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
const transactionDialog = ref(false)
const transcationHistoryDialog = ref(false)

const config = useRuntimeConfig()

const cryptoTab = ref('myCyptos')
const transactionTab = ref('buy')

const newCrypto = ref('')

const defaultNewTransaction = {
  crypto: null,
  type: transactionTab.value,
  quantity: '',
  coinPrice: '',
  totalSpent: '',
  totalReceived: ''
}

const newTransaction = ref({
  crypto: null,
  type: transactionTab.value,
  quantity: '',
  coinPrice: '',
  totalSpent: '',
  totalReceived: ''
})

const transactionHistory = ref(false)


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

const filteredCryptosOptions = ref(allCryptosOptions.value)

const userCryptosOptions = computed(() => {
  return userCryptos.value.length ? userCryptos.value.map(el => {
    return {
      label: el.name,
      value: el.$id
    }
  }) : []
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
    value: 0.95
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
    if ($q.localStorage.has('cryptoTab')) cryptoTab.value = $q.localStorage.getItem('cryptoTab')

    await fetchAllCryptos()
    await fetchDb()

    client.subscribe(`databases.${config.public.database_crypto}.collections.${config.public.collection_crypto}.documents`, response => {
      fetchUserCrypto()
    })

    client.subscribe(`databases.${config.public.database_crypto}.collections.${config.public.collection_transaction}.documents`, response => {
      fetchTransactions()
    })
  } catch (e) {
    console.error(e)
  }

})


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
    return acc + (curr.price * quantity)
  }, 0) / quantity) * currency.value.value).toFixed(2)
}


const cryptoInvest = id => {
  return (cryptoQuantity(id) * cryptoAveragePrice(id)).toFixed(2)
}

const cryptoTotal = id => {
  if (allCryptos.value && allCryptos.value.length > 0) {
    const currentPrice = allCryptos.value.find(c => c.id === id).price
    return ((currentPrice * currency.value.value) * cryptoQuantity(id)).toFixed(2)
  }
  return 'N/A'
}

const cryptoProfit = id => {
  return ((cryptoTotal(id) - cryptoInvest(id)) / cryptoInvest(id) * 100).toFixed(2)
}

const isCryptoActive = id => {
  return userCryptos.value.some(c => c.$id === id)
}

const filterFn = (val, update, abort) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredCryptosOptions.value = allCryptosOptions.value.filter(v => v.label.toLowerCase().indexOf(needle) > -1 || v.value.toLowerCase().indexOf(needle) > -1)
  })
}

const openTransaction = crypto => {
  transactionDialog.value = true
  Object.assign(newTransaction.value, defaultNewTransaction)
  newTransaction.value.crypto = {
    label: crypto.name,
    value: crypto.$id
  }
}

const saveTransaction = async () => {
  try {
    const data = {
      cryptos: newTransaction.value.crypto.value,
      quantity: newTransaction.value.quantity,
      price: newTransaction.value.coinPrice,
      type: newTransaction.value.type
    }
    $q.loading.show()
    await DB.createDocument(
      '66058142ae7ac2bc3864',
      '660fb13c51fb6f87af02',
      ID.unique(),
      data
    )
  } catch (e) {
    console.error(e)
  } finally {
    transactionDialog.value = false
    $q.loading.hide()
  }
}

const currentValue = id => {
  if (allCryptos.value && allCryptos.value.length > 0) {
    return allCryptos.value.find(c => c.id === id).price * currency.value.value.toFixed(2)
  }
  return 0
}

const totalInvest = computed(() => {
  return transactions.value.reduce((acc, curr) => {
    return acc + (curr.price * curr.quantity)
  }, 0).toFixed(2)
})

const totalActual = computed(() => {
  return transactions.value.reduce((acc, curr) => {
    console.log(curr)
    return acc + (currentValue(curr.cryptos.$id) * curr.quantity)
  }, 0).toFixed(2)
})

const totalProfit = computed(() => {
  return ((totalActual.value - totalInvest.value) / totalInvest.value * 100).toFixed(2)
})

const openTransactionsHistory = crypto => {
  transcationHistoryDialog.value = true
  transactionHistory.value = crypto
}

const transactionHistoryList = id => {
  return transactions.value.filter(t => t.cryptos?.$id === id).map(i => {
    return {
      id: i.cryptos.$id,
      transactionId: i.$id,
      name: i.cryptos.name,
      quantity: i.quantity,
      price: `${i.price * currency.value.value} ${currency.value.label}`,
      totalPrice: `${(i.price * i.quantity) * currency.value.value} ${currency.value.label}`
    }
  })
}

const deleteTransactionHistory = async item => {
  try {
    $q.loading.show()
    await DB.deleteDocument(
      '66058142ae7ac2bc3864',
      '660fb13c51fb6f87af02',
      item.transactionId
    )
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const transactionsHistoryCols = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'left',
    sortable: true
  },
  {
    name: 'name',
    field: 'name',
    label: 'Nom',
    align: 'left',
    sortable: true
  },
  {
    name: 'quantity',
    field: 'quantity',
    label: 'Quantité',
    align: 'right',
    sortable: true
  },
  {
    name: 'price',
    field: 'price',
    label: 'Prix moyen d`\'achat',
    align: 'right',
    sortable: true
  },
  {
    name: 'totalPrice',
    field: 'totalPrice',
    label: 'Total',
    align: 'right',
    sortable: true
  },
  { name: 'actions', label: 'Supprimer', field: '', align: 'center' },
]

watch(currency, val => {
  $q.localStorage.set('currency', val)
})

watch(cryptoTab, val => {
  $q.localStorage.set('cryptoTab', val)
})

watch(transactionTab, val => {
  newTransaction.value.type = val
}, { immediate: true })

watch(newTransaction.value, val => {
  if (val.quantity && val.coinPrice && val.type === 'buy') {
    newTransaction.value.totalSpent = +val.quantity * +val.coinPrice
    return
  }
  newTransaction.value.totalSpent = ''
}, { immediate: true })

watch(newTransaction.value, val => {
  if (val.quantity && val.coinPrice && val.type === 'sell') {
    newTransaction.value.totalReceived = +val.quantity * +val.coinPrice
    return
  }
  newTransaction.value.totalReceived = ''
}, { immediate: true })



</script>


<style scoped></style>