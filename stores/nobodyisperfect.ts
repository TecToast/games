import { defineStore } from "pinia";
import useGameConfig from "~/composables/useGameConfig";
import type {
  GameUserData,
  NobodyIsPerfectData,
  State,
} from "~/utils/nobodyisperfect/types";

export const useNobodyIsPerfectStore = defineStore("nobodyisperfect", () => {
  const {
    gdata,
    status,
    error,
    refreshData,
    userdata,
    unsavedChanges,
    markUnsaved,
    saveToDB,
    usersUpdatedHandler,
  } = useGameConfig<NobodyIsPerfectData, GameUserData>("nobodyisperfect");
  const state = ref<State>("overview");
  const timerStart = ref(60);
  const timer = ref(0);
  const currentQuestionIndex = ref(0);
  const answers = ref<{
    [key: string]: string;
  }>({});
  const userCount = computed(() => gdata.value!.participantsList.length);
  const totalAnswerCount = computed(() => userCount.value + 1);
  const revealedAnswers = ref<
    { answer: string; user: string; showUser: boolean; guessedThis: string[] }[]
  >([]);
  const answerMediaState = ref("nothing");

  function addPointsToUser(user: string, points: number) {
    const data = userdata.value;
    if (!data) return;
    data[user].points += points;
  }

  function switchToAnswerScreen() {
    state.value = "answer";
    timer.value = 0;
  }

  function selectAnswerForUser(user: string, answerIndex: number) {
    let index = 0;
    const url = getAvatarUrl(user);
    for (let data of revealedAnswers.value) {
      const guessed = data.guessedThis;
      const i = guessed.indexOf(url);
      if (index == answerIndex) {
        if (i == -1) {
          guessed.push(url);
        }
      } else {
        if (i != -1) {
          guessed.splice(i, 1);
        }
      }
      index++;
    }
  }

  function revealAnswerFromUser(user: string) {
    if (revealedAnswers.value.some((a) => a.user === user)) return;
    revealedAnswers.value.push({
      answer:
        user === "RICHTIG"
          ? gdata.value!.questions[currentQuestionIndex.value].answer.title
          : answers.value[user] || "",
      showUser: false,
      guessedThis: [],
      user,
    });
  }

  function revealFromWhichUser(user: string) {
    const data = revealedAnswers.value.find((a) => a.user === user);
    if (data) {
      data.showUser = true;
    }
  }

  function nextQuestion() {
    answerMediaState.value = "nothing";
    state.value = "overview";
    if (currentQuestionIndex.value < gdata.value!.questions.length - 1) {
      currentQuestionIndex.value++;
    }
    revealedAnswers.value = [];
  }

  return {
    gdata,
    status,
    error,
    userdata,
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
    usersUpdatedHandler,
  };
});
