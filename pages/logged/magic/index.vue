<template>
  <div class="column gap-md">
    <div class="row">
      <q-space />
      <q-btn @click="cardDialog = true" color="positive">Ajouter une carte</q-btn>
    </div>
    <div class="row gap-md items-center">
      <template v-for="card of cards" :key="card.title">
        <q-card class="card" :class="cardColor(card.colors)">
          <div class="column fit q-pa-md">

            <div class="row items-center gap-sm q-pl-lg q-pt-sm">
              {{ card.name }} <q-space /> {{ card.cost }}
              <q-btn-dropdown size="xs" flat rounded dropdown-icon="more_vert">
                <q-list>
                  <q-item clickable v-close-popup @click="editCard(card)">
                    <q-item-section>
                      <q-item-label>Modifier la carte</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="deleteCard(card)">
                    <q-item-section>
                      <q-item-label>Supprimer la carte</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>

            <q-separator />
            <div v-if="card.fileId" style="height: 190px;">
              <q-img style="height: 190px;" fit="fill" :src="`https://cloud.appwrite.io/v1/storage/buckets/651bed78e21021ee0a4f/files/${card.fileId}/view?project=651beccfd633c608a464&mode=admin`" />
            </div>

            <q-card-section v-else style="height: 190px; " />

            <div class="row items-center q-px-md">
              {{ card.type }} <q-space /> {{ card.expansion }}
            </div>

            <q-separator />

            <q-card-section class="col ">
              {{ card.skills.join(',') }} <br />
              {{ card.description }}
            </q-card-section>


            <div class="row items-center gap-md text-bold" style="position: relative; top: -5px;right: 18px">
              <q-space />
              {{ card.attack }} /
              {{ card.endurance }}
            </div>
          </div>
        </q-card>
      </template>
    </div>
    <q-dialog v-model="cardDialog">
      <q-card style="width: 50vw">
        <!-- HEADER -->
        <q-card-section class="row items-center">
          Nouvelle carte
          <q-space />
          <q-btn @click="cardDialog = false" icon="close" dense outlined flat round />
        </q-card-section>

        <!-- BODY -->
        <q-card-section class="column gap-md">

          <div class="row items-center gap-md">

            <!-- NAME -->
            <q-input v-model="card.name" label="Nom" class="col" outlined dense />

            <!-- COST -->
            <q-input v-model="card.cost" label="Coût" class="col" outlined dense />
          </div>

          <!-- IMG -->
          <q-file clearable bottom-slots outlined dense v-model="file" label="Image" counter>
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- COLORS -->
          <q-select v-model="card.colors" label="Couleur" :options="color" multiple outlined dense clearable use-chips emit-value
            map-options>
            <template v-slot:selected-item="props">
              <q-chip
                v-if="props"
                @remove="removeChip(props.opt)"
                removable
                dense

                :color="props.opt.color"
                text-color="white">
                {{ props.opt.label }}
              </q-chip>
              <div v-else>*none*</div>
            </template>
          </q-select>


          <div class="row items-center gap-md">

            <!-- TYPE -->
            <q-input v-model="card.type" label="Type" class="col" outlined dense />

            <!-- EXPANSION -->
            <q-input v-model="card.expansion" label="Extension" class="col" outlined dense />
          </div>

          <!-- DESCRIPTION -->
          <q-input v-model="card.description" label="Description" type="textarea" outlined dense />

          <!-- SKILLS -->
          <q-select v-model="card.skills" label="Compétences" :options="skills" multiple outlined dense clearable use-chips emit-value
            map-options>
            <template v-slot:selected-item="props">
              <q-chip
                v-if="props"
                @remove="removeChip(props.opt)"
                removable
                dense>
                {{ props.opt.label }}
              </q-chip>
            </template>
          </q-select>

          <div class="row items-center gap-md">
            <!-- ATTACK -->
            <q-input v-model="card.attack" label="Attaque" class="col" outlined dense />

            <!-- ENDURANCE -->
            <q-input v-model="card.endurance" label="Endurance" class="col" outlined dense />
          </div>
        </q-card-section>

        <!-- FOOTER -->
        <q-card-section class="row items-centers">
          <q-btn @click="cardDialog = false">Annuler</q-btn>
          <q-space />
          <q-btn @click="saveCard" color="positive">Sauvegarder</q-btn>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { DB, storage, client } from '~/utils/appwrite.js';
import { useMainStore } from '~/stores/main'
import { useQuasar, uid } from 'quasar'

const mainStore = useMainStore()
const $q = useQuasar()

const cardDialog = ref(false)

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

onMounted(() => {
  fetchCard()

  try {
    client.subscribe(`databases.${config.public.database_test}.collections.${config.public.collection_magic}.documents`, response => {
      // Callback will be executed on changes for documents A and all files.
      fetchCard()

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

const skills = [
  {
    label: 'Vol',
    value: 'fly'
  },
  {
    label: 'Vol de vie',
    value: 'lifelink'
  },
  {
    label: 'Menace',
    value: 'menace'
  }
]

const color = [
  {
    label: 'Rouge',
    value: 'R',
    color: 'red'
  },
  {
    label: 'Vert',
    value: 'G',
    color: 'green'
  }, {
    label: 'Bleu',
    value: 'U',
    color: 'blue'
  }, {
    label: 'Noir',
    value: 'B',
    color: 'black'
  },
  {
    label: 'Blanc',
    value: 'W',
    color: 'yellow'
  }
]

const fetchCard = async () => {
  try {
    const response = await DB.listDocuments(
      '655e0d807da8e3dce780',
      '655e0d89c8ee2375cf8f'
    )
    cards.value = response?.documents
  }
  catch (e) {
    console.error(e)
  }
}


const saveCard = async () => {
  try {
    if (file.value) {
      const fileId = uid()
      card.fileId = fileId
      await storage.createFile(
        '651bed78e21021ee0a4f',
        fileId,
        file.value
      )
    }

    $q.loading.show()
    await DB.createDocument(
      '655e0d807da8e3dce780',
      '655e0d89c8ee2375cf8f',
      ID.unique(),
      card
    )
    $q.notify({ message: 'Carte enregistré avec succès', color: 'positive' })
    cardDialog.value = false
  } catch (e) {
    $q.notify({ message: 'Erreur lors de la création', color: 'negative' })
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const editCard = _card => {
  Object.assign(card, _card)
  cardDialog.value = true
}

const deleteCard = async (card) => {
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

const cardColor = colors => {
  if (!colors || !colors.length) return 'card-uncolor'
  if (colors.length > 1) return 'card-multi'
  if (colors[0] === 'B') return 'card-black'
  if (colors[0] === 'G') return 'card-green'
  if (colors[0] === 'U') return 'card-blue'
  if (colors[0] === 'W') return 'card-white'
  if (colors[0] === 'R') return 'card-red'

}

watch(cardDialog, val => {
  if (!val) {
    Object.assign(card, defaultCard)
    file.value = null
  }
})



</script>


<style scoped>
.card {
  width: 300px;
  height: 420px;
  background-size: cover;
}

.card-red {
  background-image: url('~/assets/img/red.jpg');
}

.card-black {
  background-image: url('~/assets/img/black.jpg');
}

.card-white {
  background-image: url('~/assets/img/white.jpg');
}

.card-green {
  background-image: url('~/assets/img/green.jpg');
}

.card-blue {
  background-image: url('~/assets/img/blue.jpg');
}

.card-multi {
  background-image: url('~/assets/img/multi.jpg');
}

.card-uncolor {
  background-image: url('~/assets/img/uncolor.jpg');
}
</style>