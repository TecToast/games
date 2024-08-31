import { defineStore } from "pinia";
import { watch } from "vue";
import { AnswerState, type JeopardyData } from "~/utils/jeopardy/types";
import type { UserData } from "~/utils/jeopardy/types";
import { useRoute } from "vue-router";
import useGameConfig from "~/composables/useGameConfig";

export const useJeopardyStore = defineStore("jeopardy", () => {
  const route = useRoute();
  const {
    gdata: jdata,
    status,
    error,
    refreshData,
    users,
    unsavedChanges,
    markUnsaved,
    saveToDB,
  } = useGameConfig<JeopardyData, UserData>("jeopardy");
  const currentUser = ref("");
  const currentQuestion: Ref<{ category: string; points: number } | undefined> =
    ref(undefined);
  const questionRevealed = ref(false);
  const answerState = ref(AnswerState.Unanswered);

  function toID(param: string | number) {
    return param.toString().replace(idReplaceRegex, "");
  }

  const nameUnwrapper = computed(() => {
    const data = jdata.value;
    if (!data) return null;
    const unwrapper: {
      categories: { [x: string]: string };
      questions: { [x: string]: { [x: string]: string } };
    } = {
      categories: {},
      questions: {},
    };
    for (const [key, value] of Object.entries(data.categories)) {
      const keyID = toID(key);
      unwrapper.categories[keyID] = key;
      unwrapper.questions[keyID] = {};
      for (const innerKey of Object.keys(value)) {
        unwrapper.questions[keyID][innerKey] = innerKey;
      }
    }
    return unwrapper;
  });

  function toggleJokerFromUser(user: string, joker: string) {
    const userdata = users.value;
    if (!userdata) return;
    const jokers = userdata.data[user].jokers;
    const jokerIndex = jokers.indexOf(joker);
    if (jokerIndex === -1) {
      jokers.push(joker);
      return;
    }
    jokers.splice(jokerIndex, 1);
  }

  function addPointsToUser(user: string, points: number) {
    const userdata = users.value;
    if (!userdata) return;
    userdata.data[user].points += points;
  }

  function nextPlayerAndMainPage() {
    const data = users.value;
    if (!data) return;
    const userKeys = data.list;
    const currentUserIndex = userKeys.indexOf(currentUser.value);
    currentUser.value = userKeys[(currentUserIndex + 1) % userKeys.length];
    mainPage();
  }

  function mainPage() {
    currentQuestion.value = undefined;
  }

  function selectQuestion(category: string, points: number) {
    if (!jdata.value) return;
    const question = jdata.value.categories[category][points];
    if (question.used) {
      question.used = false;
      return;
    }
    questionRevealed.value = false;
    answerState.value = AnswerState.Unanswered;
    currentQuestion.value = { category, points };
    setTimeout(() => {
      question.used = !question.used;
    }, 20);
  }

  watch(
    () => currentQuestion.value,
    (question) => {
      if (route.path.endsWith("control")) return;
      navigateTo(
        "/jeopardy/play/" +
          route.params.id +
          (question ? "/question" : "/main"),
      );
    },
  );

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
    saveToDB,
  };
});

export const idRegex = /^[A-Za-z0-9]+$/g;
export const idReplaceRegex = /[^A-Za-z0-9]/g;
