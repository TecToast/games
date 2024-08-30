<script lang="ts" setup>
const route = useRoute();
const jeopardy = useJeopardyStore();

const displayText = computed(() => {
  const unwrap = jeopardy.nameUnwrapper;
  if (!unwrap) return "";

  const { id, category, points } = route.params;
  const catname = category?.toString();

  const test = [
    id,
    ...(category ? [unwrap.categories[catname]] : []),
    ...(points ? [unwrap.questions[catname][points.toString()]] : []),
  ];
  return test.join("/");
});
</script>

<template>
  <div class="mt-4 flex justify-center">
    <TextBox class="px-4">{{ displayText }}</TextBox>
  </div>
</template>
