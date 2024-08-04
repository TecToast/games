<script lang="ts" setup>
const route = useRoute();
const { id, category, points } = route.params;
const jeopardy = useJeopardyStore();
const { jdata } = storeToRefs(jeopardy);
const qData = computed(() => jdata.value?.categories[category.toString()][points.toString()])
watch(
  [
    () => qData.value?.question.title,
    () => qData.value?.question.image,
    () => qData.value?.answer.title,
    () => qData.value?.answer.image
  ],
  () => jeopardy.markUnsaved())
</script>

<template>
  <div v-if="qData">
    <JeopardyQAConfig name="Question" v-model:text="qData.question.title" v-model:file="qData.question.image" />
    <JeopardyQAConfig name="Answer" v-model:text="qData.answer.title" v-model:file="qData.answer.image" />
    <NuxtLink :to="`/jeopardy/config/${id}/${category}`" class="flex justify-center">
      <ControlButton class="mt-4">Back to {{ category }}</ControlButton>
    </NuxtLink>
  </div>
</template>