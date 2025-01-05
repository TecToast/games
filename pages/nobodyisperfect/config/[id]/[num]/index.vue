<script lang="ts" setup>
const route = useRoute();
const { id, num } = route.params;
const game = useNobodyIsPerfectStore();
const { gdata } = storeToRefs(game);

const qData = computed(() => {
  const data = gdata.value;
  if (!data) return null;
  return data.questions[Number.parseInt(num.toString()) - 1]
});
watch(
  [
    () => qData.value?.question.title,
    () => qData.value?.question.file,
    () => qData.value?.question.audio,
    () => qData.value?.answer.title,
    () => qData.value?.answer.file,
    () => qData.value?.answer.audio,
  ],
  () => game.markUnsaved(),
);
</script>

<template>
  <div v-if="qData">
    <NobodyisperfectQAConfig
      name="Question"
      v-model:text="qData.question.title"
      v-model:file="qData.question.file"
      v-model:audio="qData.question.audio"
    />
    <NobodyisperfectQAConfig
      name="Answer"
      v-model:text="qData.answer.title"
      v-model:file="qData.answer.file"
      v-model:audio="qData.answer.audio"
    />
    <NuxtLink
      :to="`/nobodyisperfect/config/${id}`"
      class="flex justify-center"
    >
      <ControlButton class="mt-4">Back</ControlButton>
    </NuxtLink>
  </div>
</template>
