<script lang="ts" setup>
const quiz = useMusicQuizStore();
const { status } = storeToRefs(quiz);
await until(status).not.toBe("pending");
function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!quiz.unsavedChanges) return;
  event.preventDefault();
  event.returnValue = ""; // This is required for some browsers to show the confirmation dialog
}

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <DefaultBackground class="items-center">
    <NuxtPage />
  </DefaultBackground>
  <div v-if="quiz.unsavedChanges" class="fixed bottom-0 right-0 p-4">
    <ControlButton @click="quiz.saveToDB()" class="bg-orange-600"
      >Save to server</ControlButton
    >
  </div>
</template>
