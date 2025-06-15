import { defineStore } from "pinia";
import {
  type GameUserData,
  type JeopardyData,
  AnswerState,
} from "~/utils/jeopardy/types";
import useGameConfig from "~/composables/useGameConfig";

export const useJeopardyStore = defineStore("jeopardy", () => {
  const {
    gdata: jdata,
    status,
    error,
    refreshData,
    userdata,
    unsavedChanges,
    markUnsaved,
    saveToDB,
    usersUpdatedHandler,
  } = useGameConfig<JeopardyData, GameUserData>("jeopardy");
  const currentUser = ref("");
  const currentQuestion: Ref<{ category: string; points: number } | undefined> =
    ref(undefined);
  const questionRevealed = ref(false);
  const answerState = ref(AnswerState.Unanswered);

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
    const usedJokers = userdata.value[user].usedJokers;
    const jokerIndex = usedJokers.indexOf(joker);
    if (jokerIndex === -1) {
      usedJokers.push(joker);
      return;
    }
    usedJokers.splice(jokerIndex, 1);
  }

  function addPointsToUser(user: string, points: number) {
    userdata.value[user].points += points;
  }

  function nextPlayerAndMainPage() {
    const userKeys = jdata.value?.participantsList;
    if (!userKeys) return;
    const currentUserIndex = userKeys.indexOf(currentUser.value);
    currentUser.value = userKeys[(currentUserIndex + 1) % userKeys.length];
    mainPage();
  }

  function mainPage() {
    currentQuestion.value = undefined;
  }

  function selectQuestion(category: string, points: number) {
    if (!jdata.value) return;
    const question = jdata.value?.categories?.[category]?.[points];
    if (!question) return;
    if (question.used) {
      question.used = false;
      return;
    }
    questionRevealed.value = false;
    answerState.value = AnswerState.Unanswered;
    currentQuestion.value = { category, points };
    question.used = !question.used;
  }

  return {
    jdata,
    status,
    error,
    userdata,
    currentUser,
    currentQuestion,
    questionRevealed,
    answerState,
    unsavedChanges,
    nameUnwrapper,
    toggleJokerFromUser,
    addPointsToUser,
    nextPlayerAndMainPage,
    mainPage,
    selectQuestion,
    refreshData,
    markUnsaved,
    saveToDB,
    usersUpdatedHandler,
  };
});

export function toID(param: string | number) {
  return param.toString().replace(idReplaceRegex, "");
}

export const idRegex = /^[A-Za-z0-9]+$/g;
export const idReplaceRegex = /[^A-Za-z0-9]/g;
