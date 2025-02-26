<script lang="ts" setup>
const game = useJeopardyStore();
const { status } = storeToRefs(game);
await until(status).not.toBe("pending");
function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!game.unsavedChanges) return;
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
    <ConfigHeader />
    <NuxtPage />
    <div v-if="game.unsavedChanges" class="fixed bottom-0 right-0 p-4">
      <ControlButton class="bg-orange-600" @click="game.saveToDB()"
        >Save to server</ControlButton
      >
    </div>
  </DefaultBackground>
</template>
