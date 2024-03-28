<template>
  <div class="column gap-md">
    <h2 class="text-center">
      Bienvenue sur votre tableau de bord
    </h2>
    <div class="row">
      <q-space />
      <q-btn @click="openAddListModal" color="positive">Ajouter une liste</q-btn>
    </div>


    <!-- DASHBOARDS -->

    <div class="row col justify-around">

      <!-- TODO -->
      <template v-for="list of lists" :key="list.id">
        <div class="col trello-list gap-md"
          @drop="onDrop($event, list.label)" @dragenter="checkDrop" @dragover="checkDrop">

          <div class="row items-center gap-md justify-between">
            <span>{{ list.label }}</span>
            <q-btn-dropdown flat dense rounded dropdown-icon="more_vert" color="primary">
              <q-list>
                <q-item clickable v-close-popup @click="openAddCardModal(list.label)">
                  <q-item-section>
                    <q-item-label>Ajouter une carte</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="deleteList(list.id)">
                  <q-item-section>
                    <q-item-label>Supprimer la liste</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <q-separator spaced color="primary" />

          <q-list class="gap-md column">
            <template v-for="card of getCards(list)">
              <q-item class="trello-item" clickable draggable @dragstart="dragStart($event, card)">
                <q-item-section v-if="card.label">
                  {{ card.label }}
                </q-item-section>
                <q-item-section>
                  {{ card.id }} {{ card.state }}
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </div>
      </template>

    </div>

    <!-- Add list modal -->
    <q-dialog v-model="addListModal" persistent>
      <q-card>
        <q-card-section>
          <q-input v-model="newList.label" outlined label="label"></q-input>
        </q-card-section>
        <q-card-section>
          <q-btn @click="closeAddListModal">Fermer</q-btn>
          <q-btn @click="addList" color="positive">Ajouter</q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add card modal -->
    <q-dialog v-model="addCardModal" persistent>
      <q-card>
        <q-card-section>
          <q-input v-model="newCard.label" outlined label="label"></q-input>
        </q-card-section>
        <q-card-section>
          <q-btn @click="closeAddCardModal">Fermer</q-btn>
          <q-btn @click="addCard" color="positive">Ajouter</q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>

// LISTS

const lists = ref([
  {
    id: 1,
    label: 'TODO'
  },
  {
    id: 2,
    label: 'IN_PROGRESS'
  },
  {
    id: 3,
    label: 'DONE'
  }
])


const addListModal = ref(false)


const newList = ref({ id: '', label: '' })

const addList = () => {
  lists.value.push(newList.value)
  closeAddListModal()
}

const openAddListModal = () => {
  addListModal.value = true
  let maxListIdx = 0
  lists.value.forEach(element => {
    if (element.id > maxListIdx) maxListIdx = element.id
  })
  console.log(newList.value)
  newList.value.id = maxListIdx + 1
  newList.value.label = ''
  console.log(newList.value)

}

const closeAddListModal = () => {
  addListModal.value = false
}

const deleteList = listId => {
  const idx = lists.value.findIndex(l => l.id === listId)
  lists.value.splice(idx, 1)
}

// CARDS

const cards = ref([
  {
    id: 1,
    state: 'TODO'
  },
  {
    id: 2,
    state: 'IN_PROGRESS'
  },
  {
    id: 3,
    state: 'DONE'
  },
  {
    id: 4,
    state: 'TODO'
  }
])

const addCardModal = ref(false)


const newCard = ref({ id: '', state: '' })

const addCard = () => {
  cards.value.push(newCard.value)
  closeAddCardModal()
}

const openAddCardModal = listLabel => {
  addCardModal.value = true
  let maxCardIdx = 0
  cards.value.forEach(element => {
    if (element.id > maxCardIdx) maxCardIdx = element.id
  })

  newCard.value.id = maxCardIdx + 1
  newCard.value.label = ''
  newCard.value.state = listLabel
}

const closeAddCardModal = () => {
  addCardModal.value = false
}

const getCards = list => {
  return cards.value.filter(c => c.state === list.label)
}


const dragStart = (ev, card) => {
  console.log('drag start')
  ev.dataTransfer.dropEffect = 'move'
  ev.dataTransfer.effectAllowed = 'move'
  ev.dataTransfer.setData('cardId', card.id)
}

const onDrop = (ev, state) => {
  const cardId = ev.dataTransfer.getData('cardId')
  const card = cards.value.find(item => +item.id === +cardId)
  card.state = state
}

const checkDrop = ev => {
  ev.preventDefault()
}

</script>

<style scoped>
.trello-list {
  max-width: 300px;
  border: solid 1px blue;
  padding: 8px;
}

.trello-item {
  cursor: grab;
  border: 1px solid red;
}
</style>
