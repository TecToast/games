<script lang="ts" setup>
const route = useRoute();
const { id, category, points } = route.params;
const jeopardy = useJeopardyStore();
const { jdata } = storeToRefs(jeopardy);
const catNameResolved = computed(() => {
  const unwrap = jeopardy.nameUnwrapper;
  if (!unwrap) return "";
  return unwrap.categories[category.toString()];
});
const qData = computed(() => {
  const data = jdata.value;
  if (!data) return null;
  const unwrap = jeopardy.nameUnwrapper!;
  const catName = category.toString();
  return data.categories[catNameResolved.value][
    unwrap.questions[catName][points.toString()]
  ];
});
watch(
  [
    () => qData.value?.question.title,
    () => qData.value?.question.image,
    () => qData.value?.answer.title,
    () => qData.value?.answer.image,
  ],
  () => jeopardy.markUnsaved(),
);
</script>

<template>
  <div v-if="qData">
    <JeopardyQAConfig
      name="Question"
      v-model:text="qData.question.title"
      v-model:file="qData.question.image"
    />
    <JeopardyQAConfig
      name="Answer"
      v-model:text="qData.answer.title"
      v-model:file="qData.answer.image"
    />
    <NuxtLink
      :to="`/jeopardy/config/${id}/${jeopardy.toID(category.toString())}`"
      class="flex justify-center"
    >
      <ControlButton class="mt-4">Back to {{ catNameResolved }}</ControlButton>
    </NuxtLink>
  </div>
</template>
