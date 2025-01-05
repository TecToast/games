import { defineStore } from "pinia";
import useGameConfig from "~/composables/useGameConfig";
import type {
  NobodyIsPerfectData,
  State,
  UserData,
} from "~/utils/nobodyisperfect/types";

export const useNobodyIsPerfectStore = defineStore("nobodyisperfect", () => {
  const {
    gdata,
    status,
    error,
    refreshData,
    users,
    unsavedChanges,
    markUnsaved,
    saveToDB,
  } = useGameConfig<NobodyIsPerfectData, UserData>("nobodyisperfect");
  const state = ref<State>("overview");
  const timerStart = ref(60)
  const timer = ref(0);
  const currentQuestionIndex = ref(0);
  const answers = ref<{
    [key: string]: string;
  }>({});
  const userCount = computed(() => users.value!.list.length);
  const totalAnswerCount = computed(() => userCount.value + 1);
  const revealedAnswers = ref<{answer: string, user: string, showUser: boolean, guessedThis: string[]}[]>([]);
  const answerMediaState = ref('nothing');

  function addPointsToUser(user: string, points: number) {
    const userdata = users.value;
    if (!userdata) return;
    userdata.data[user].points += points;
  }

  function switchToAnswerScreen() {
    if (!users.value) return;
    state.value = "answer";
    timer.value = 0;
  }

  function selectAnswerForUser(user: string, answerIndex: number) {
    let index = 0;
    const url = users.value!.data[user].avatarUrl
    for (let data of revealedAnswers.value) {
      const guessed = data.guessedThis
      if(index == answerIndex) {
        guessed.push(url)
      } else {
        const i = guessed.indexOf(url)
        if(i != -1) {
          guessed.splice(i, 1)
        }
      }
      index++;
    }

  }

  function revealAnswerFromUser(user: string) {
    if(revealedAnswers.value.some((a) => a.user === user)) return;
    revealedAnswers.value.push({
      answer: user === 'RICHTIG' ? gdata.value!.questions[currentQuestionIndex.value].answer.title : (answers.value[user] || ""),
      showUser: false,
      guessedThis: [],
      user
    })
  }

  function revealFromWhichUser(user: string) {
    const data = revealedAnswers.value.find((a) => a.user === user)
    if (data) {
      data.showUser = true;
    }
  }

  function nextQuestion() {
    answerMediaState.value = "nothing";
    state.value = "overview";
    currentQuestionIndex.value++;
    revealedAnswers.value = [];
  }

  return {
    gdata,
    status,
    error,
    users,
    unsavedChanges,
    state,
    currentQuestionIndex,
    timer,
    timerStart,
    answers,
    userCount,
    totalAnswerCount,
    revealedAnswers,
    answerMediaState,

    addPointsToUser,
    refreshData,
    markUnsaved,
    saveToDB,
    switchToAnswerScreen,
    selectAnswerForUser,
    nextQuestion,
    revealFromWhichUser,
    revealAnswerFromUser,
  };
});
