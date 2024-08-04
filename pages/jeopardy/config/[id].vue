<script lang="ts" setup>

const jeopardy = useJeopardyStore();
const { status } = storeToRefs(jeopardy);
await until(status).not.toBe('pending')
function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!jeopardy.unsavedChanges) return;
  event.preventDefault();
  event.returnValue = ''; // This is required for some browsers to show the confirmation dialog
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
  <DefaultBackground class="items-center">
    <ConfigHeader />
    <NuxtPage />
  </DefaultBackground>
  <div v-if="jeopardy.unsavedChanges" class="fixed bottom-0 right-0 p-4">
    <ControlButton @click="jeopardy.saveToDB()" class="bg-orange-600">Save to server</ControlButton>
  </div>
</template>