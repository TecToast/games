import { defineStore } from 'pinia'
import { watch } from 'vue'
import { AnswerState, type JeopardyData } from '~/utils/jeopardy/types'
import { useRoute } from 'vue-router'

export const useJeopardyStore = defineStore('jeopardy', () => {
  const router = useRouter()
  const route = useRoute()
  const { data: jdata, status, error, refresh: refreshData } = useFetch<JeopardyData>(`/api/jeopardy/data/${route.params.id}`)
  const users = computed(() => jdata.value?.participants)
  const currentUser = ref('')
  const currentQuestion: Ref<{ category: string, points: number } | undefined> = ref(undefined)
  const questionRevealed = ref(false)
  const answerState = ref(AnswerState.Unanswered)

  const unsavedChanges = ref(false)

  function toID(param: string | number) {
    return param.toString().replace(idReplaceRegex, '')
  }

  const nameUnwrapper = computed(() => {
    const data = jdata.value
    if (!data) return null
    const unwrapper: { categories: { [x: string]: string }, questions: { [x: string]: { [x: string]: string } } } = {
      categories: {},
      questions: {}
    }
    for (const [key, value] of Object.entries(data.categories)) {
      const keyID = toID(key)
      unwrapper.categories[keyID] = key
      unwrapper.questions[keyID] = {}
      for (const innerKey of Object.keys(value)) {
        unwrapper.questions[keyID][innerKey] = innerKey
      }
    }
    return unwrapper

  })



  function toggleJokerFromUser(user: string, joker: string) {
    const userdata = users.value
    if (!userdata) return
    const jokers = userdata[user].jokers
    const jokerIndex = jokers.indexOf(joker)
    if (jokerIndex === -1) {
      jokers.push(joker)
      return
    }
    jokers.splice(jokerIndex, 1)
  }

  function addPointsToUser(user: string, points: number) {
    const userdata = users.value
    if (!userdata) return
    userdata[user].points += points
  }

  function nextPlayerAndMainPage() {
    if (!users.value) return
    const userKeys = Object.keys(users.value)
    const currentUserIndex = userKeys.indexOf(currentUser.value)
    currentUser.value = userKeys[(currentUserIndex + 1) % userKeys.length]
    mainPage()
  }

  function mainPage() {
    currentQuestion.value = undefined
  }

  function selectQuestion(category: string, points: number) {
    if (!jdata.value) return
    const question = jdata.value.categories[category][points]
    if (question.used) {
      question.used = false
      return
    }
    questionRevealed.value = false
    answerState.value = AnswerState.Unanswered
    currentQuestion.value = { category, points }
    setTimeout(() => {
      question.used = !question.used
    }, 20)
  }

  function navigateTo(path: string) {
    if (route.path.endsWith("control")) return
    router.push(path)
  }

  function markUnsaved() {
    unsavedChanges.value = true
  }

  function saveToDB() {
    const data = jdata.value
    if (!data) return
    $fetch(`/api/jeopardy/update/${route.params.id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    unsavedChanges.value = false
  }




  watch(() => currentQuestion.value, (question) => {
    const baseUrl = '/jeopardy/play/' + route.params.id
    navigateTo(baseUrl + (question ? '/question' : '/main'))
  })


  return {
    jdata,
    status,
    error,
    users,
    currentUser,
    currentQuestion,
    questionRevealed,
    answerState,
    unsavedChanges,
    nameUnwrapper,
    toID,
    toggleJokerFromUser,
    addPointsToUser,
    nextPlayerAndMainPage,
    mainPage,
    selectQuestion,
    refreshData,
    markUnsaved,
    saveToDB
  }
})


export const idRegex = /^[A-Za-z0-9]+$/g
export const idReplaceRegex = /[^A-Za-z0-9]/g