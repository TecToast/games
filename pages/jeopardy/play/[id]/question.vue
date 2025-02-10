<script lang="ts" setup>
import { AnswerState } from "~/utils/jeopardy/types";

const jeopardy = useJeopardyStore();
const route = useRoute();
const { jdata, currentQuestion, questionRevealed, answerState } =
  storeToRefs(jeopardy);
const questionData = computed(() => {
  if (!currentQuestion.value) return null;
  const temp = jdata?.value?.categories[currentQuestion.value.category];
  return temp ? temp[currentQuestion.value.points] : null;
});
const questionSrc = computed(() => {
  if (
    !questionData.value?.question?.image ||
    !currentQuestion.value ||
    !jdata.value
  )
    return "";
  return `/api/jeopardy/media/${jdata.value?.host}/${route.params.id}/${toID(currentQuestion.value!.category)}/${toID(currentQuestion.value!.points)}/Question/${questionData.value!.question.image}`;
});
const answerSrc = computed(() => {
  if (
    !questionData.value?.answer?.image ||
    !currentQuestion.value ||
    !jdata.value
  )
    return "";
  return `/api/jeopardy/media/${jdata.value?.host}/${route.params.id}/${toID(currentQuestion.value!.category)}/${toID(currentQuestion.value!.points)}/Answer/${questionData.value!.answer.image}`;
});
const link = computed(() => [
  ...(questionSrc.value
    ? [{ rel: "preload", href: questionSrc.value, as: "image" }]
    : []),
  ...(answerSrc.value
    ? [{ rel: "preload", href: answerSrc.value, as: "image" }]
    : []),
]);
console.log(link);
useHead({
  // @ts-ignore
  link: link,
});
</script>

<template>
  <div style="background-image: linear-gradient(#8902c7, #4402c7)" class="min-h-screen">
    <div v-if="questionData && currentQuestion" class="flex w-screen flex-col items-center gap-10">
      <TextBox class="mt-4 w-screen">{{ currentQuestion.category }} - {{ currentQuestion.points }}</TextBox>
      <TextBox v-if="
        !questionData.answer.image || answerState == AnswerState.Unanswered
      "
        class="flex h-52 min-w-[50vw] max-w-[50vw] items-center justify-center overflow-auto text-wrap border border-gray-800">
        {{ questionRevealed ? questionData.question.title : "" }}
      </TextBox>
      <img v-if="
        questionRevealed &&
        questionData.question.image &&
        answerState == AnswerState.Unanswered
      " :src="questionSrc" alt="Bild" class="h-[60vh]" />
      <TextBox v-if="answerState != AnswerState.Unanswered"
        class="flex h-52 min-w-[50vw] max-w-[50vw] items-center justify-center overflow-auto text-wrap border-8" :class="{
          'border-red-700': answerState == AnswerState.Incorrect,
          'border-green-700': answerState == AnswerState.Correct,
        }">
        {{ questionData.answer.title }}
      </TextBox>
      <img v-if="
        questionData.answer.image && answerState != AnswerState.Unanswered
      " :src="answerSrc" alt="Bild" class="h-[60vh]" />
    </div>
  </div>
</template>
