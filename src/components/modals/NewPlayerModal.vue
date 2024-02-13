<template>

  <NModal
    v-model:show="state.modals.newPlayerModal"
    type="success"
    preset="dialog"
    title="New Player"
  >

    <template #header>
      <div>New Player</div>
    </template>

    <NForm ref="formRef" :model="model" :rules="rules" size="large">

      <NFormItem path="name" label="Character Name">
        <NInput v-model:value="model.name" @keydown.enter="handleValidation" placeholder="Choose a name"/>
        <NButton size="medium" type="warning" ghost @click="generateName">Random</NButton>
      </NFormItem>


      <NFormItem path="password" label="Password">
        <NInput v-model:value="model.password" type="password" @keydown.enter="handleValidation" placeholder="Choose a password"/>
      </NFormItem>

      <NFormItem path="repeatPassword" label="Repeat Password">
        <NInput v-model:value="model.repeatPassword" type="password" @keydown.enter="handleValidation" placeholder="Repeat your password"/>
      </NFormItem>

      <NFormItem path="tutorial" label="Start the tutorial?">
        <NSwitch v-model:value="model.tutorial" />
      </NFormItem>

    </NForm>

    <template #action>
      <NButton type="success" ghost @click="handleValidation">Play!</NButton>
    </template>

  </NModal>

</template>

<script setup>
import { ref, onMounted } from 'vue'

import { NModal, NForm, NFormItem, NInput, NButton, NSwitch } from 'naive-ui'
import { state } from '@/composables/state'

import { useWebSocket } from '@/composables/web_socket'
const { send } = useWebSocket()

const formRef = ref(null)

const model = ref({
  name: '',
  password: '',
  repeatPassword: '',
  tutorial: true
})

function validatePasswordSame(rule, value) {
  return value === model.value.password
}

const rules = {
  name: [
    {
      required: true,
      trigger: ['input', 'blur'],
      validator (rule, value) {
        if (!value) {
          return new Error('Name is required')
        } else if (value.length < 3) {
          return new Error('Name is too short')
        } else if (value.length > 15) {
          return new Error('Name is too long')
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          return new Error('Name can only contain letters')
        }
      }
    },
    {
      message: 'Name is already taken, please choose another',
      trigger: ['blur'],
      asyncValidator: () => {
        return new Promise((resolve, reject) => {
          state.nameExistsResolve = resolve
          state.nameExistsReject = reject
          send('nameExists', { name: model.value.name })
        })
      }
    }
  ],

  password: [
    {
      required: true,
      message: "Password is required",
      trigger: ['password-input', 'blur'],
    }
  ],

  repeatPassword: [
    {
      required: true,
      message: "Repeat Password is required",
      trigger: ['password-input', 'blur'],
    },

    {
      validator: validatePasswordSame,
      message: 'Password is not same as re-entered password!',
      trigger: ['password-input', 'blur'],
    },

    {
      message: 'Invalid character name',
      asyncValidator: () => {
        return new Promise((resolve, reject) => {
          state.loginResolve = resolve
          state.loginReject = reject
          send('create', {
            name: model.value.name,
            password: model.value.password,
            width: 100,
            height: 24,
            tutorial: model.value?.tutorial ? 'Y' : 'N',
            ttype: 'play.proceduralrealms.com'
          })
        })
      }
    }
  ]
}

function handleValidation (e) {
  e.preventDefault()
  formRef.value?.validate().then(() => {
  }).catch(() => {
  })
}

let chain = null
let nodeLength = 3
let names = [
'Medea', 'Atlantes', 'Fitcher', 'Gwydion', 'Merlin',
'Gandalf', 'Arthur', 'Drizzt', 'Rapunzel', 'Gideon',
'Proteus', 'Conan', 'Mordenkainen', 'Nystul', 'Leomund',
'Elminster', 'Khelben', 'Magius', 'Smeagol', 'Boramir',
'Paladine', 'Blackwolf', 'Balthazar', 'Roland', 'Ghidorah',
'Bilbo', 'Frodo', 'Aragorn', 'Araphant', 'Gwindor', 'Baldor',
'Beren', 'Calmacil', 'Castamir', 'Denethor', 'Dorian', 'Elrond',
'Eldarion', 'Forlong', 'Frumgar', 'Grimbold', 'Gimli', 'Hador',
'Hirgon', 'Iorias', 'Ivorwen', 'Khamul', 'Legolas', 'Luthien',
'Miriel', 'Nelias', 'Nimioth', 'Nelias', 'Orophin', 'Lucian',
'Ondohor', 'Pallando', 'Pippin', 'Radagast', 'Rogash', 'Salmar',
'Sauron', 'Targon', 'Thengel', 'Uldor', 'Ulric', 'Valandil',
'Vardamir', 'Wulfgar', 'Waldo', 'Alfred', 'Dwayne', 'Welby',
'Brady', 'Maurice', 'Ethan', 'Winfrey', 'Johan', 'Sherborne',
'Kinnard', 'Orlando', 'Reynolds', 'Jackson', 'Marlow',
'Helen', 'Kylarius', 'Alcott', 'Maidel', 'Karlee', 'Chelsie',
'Katherine', 'Carson', 'Alysha', 'Destiney', 'Ana', 'Serena',
'Loella', 'Gabriella', 'Cassidy', 'Justine', 'Elyssa',
'Jessica', 'Katie', 'Colleen', 'Jazlyn', 'Makenzie', 'Saldon',
'Jazmine', 'Carlton', 'Emilee', 'Hannah', 'Clovis', 'Kiya',
'Olivia', 'Brenna', 'Laney', 'Nadia', 'Lexi',
'Kemble', 'Lindsey', 'Chastity', 'Autumn', 'Juliette',
'Maitane', 'Kimblee', 'Blanca', 'Manhattan', 'Honey', 'Ashli',
'Kymberly', 'Tamara', 'Yazmin', 'Alysha', 'Kaila', 'Jasnah',
'Beric', 'Logan', 'Isidora', 'Mira', 'Tielo', 'Aurora', 'Elowen',
'Evender', 'Aria', 'Amethyst', 'Zelda', 'Twilio', 'Tabitha',
'Samantha', 'Salvatore', 'Mikhale', 'Ambrose', 'Hawthorne',
'Talmir', 'Khalon', 'Radvia', 'Kinnay', 'Salome', 'Varia',
'Auren', 'Kinari', 'Alcari', 'Forgon', 'Kinioth', 'Khayne',
'Procka', 'Medash', 'Fastidious', 'Calgary', 'Alberta', 'Montreal',
'Anastasia', 'Aphrodite', 'Abraxas', 'Alastriona', 'Albion', 'Aeronwy',
'Artemis', 'Arwen', 'Astraia', 'Astrid', 'Astoria', 'Ankhara', 'Asphodel',
'Bronwyn', 'Belladonna', 'Chandra', 'Calliope', 'Corinda', 'Crescent',
'Caelia', 'Clarion', 'Darius', 'Elara', 'Ethelinda', 'Evangelia', 'Evander',
'Emrys', 'Eirian', 'Ferelith', 'Fiona', 'Galahad', 'Gawain', 'Guinevere',
'Izora', 'Joliette', 'Jorinda', 'Khione', 'Lavinia', 'Lucienne', 'Lysander',
'Lysandra', 'Lueclia', 'Melisandre', 'Morgaine', 'Miriam', 'Morrigan', 'Morgana',
'Myrcella', 'Maelona', 'Oberon', 'Persephone', 'Rosabella', 'Taliesin', 'Tamora',
'Titania', 'Tristan', 'Uther', 'Viviane', 'Willow'
]
let consonents = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'qu', 'r', 's', 't', 'v', 'w', 'x','z']

function buildChain () {
  let chain = {}
  for (let i = 0; i < names.length; i++) {
    let name = names[i]
    for (let j = 0; j < name.length; j += nodeLength) {
      if (!chain[j]) {
        chain[j] = {}
      }
      let key = name.substr(j, nodeLength).toLowerCase()
      if (!chain[j][key]) {
        chain[j][key] = 1
      } else {
        chain[j][key]++
      }
    }
  }
  return chain
}

function selectName () {
  let links = 2 + Math.floor(Math.random() * 3)
  let name = ''
  for (let i = 0; i < links * nodeLength; i += nodeLength) {
    let total = 0
    for (let key in chain[i]) {
      total += chain[i][key]
    }
    let roll = Math.floor(Math.random() * total)

    total = 0
    for (let key in chain[i]) {
      total += chain[i][key]
      if (roll < total) {
        name += key
        break
      }
    }
  }

  let numConsonents = 0
  let numVowels = 0
  let finalName = ''
  for (let i = 0; i < name.length; i++) {
    if (consonents.indexOf(name[i]) != -1) {
      numConsonents++
      numVowels = 0
    } else {
      numVowels++
      numConsonents = 0
    }
    if (numVowels >= 3) {
      continue
    }
    if (numConsonents >= 3) {
      continue
    }
    finalName += name[i]
  }
  return finalName.charAt(0).toUpperCase() + finalName.slice(1)
}

function generateName () {
  if (!chain) {
    chain = buildChain()
  }

  model.value.name = selectName()
}

onMounted(() => generateName())
</script>

<style lang="less">
</style>
