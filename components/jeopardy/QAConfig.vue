<script lang="ts" setup>
const props = defineProps<{
  name: string;
}>();

const route = useRoute();
const { id, category, points } = route.params;
const jeopardy = useJeopardyStore();

const text = defineModel("text", { type: String });
const fileName = defineModel("file", { type: String });
const fileInput = ref<HTMLInputElement | null>(null);

const { handleFileInput, files } = useFileStorage({ clearOldFiles: true });
async function handleFile(event: Event) {
  await handleFileInput(event);
  if (files.value.length > 0) {
    await $fetch("/api/upload", {
      method: "POST",
      body: {
        file: files.value[0],
      },
    });
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="mt-4 text-center text-3xl font-bold text-gray-300">
      {{ props.name }}:
    </div>
    <textarea
      class="mt-4 h-[10vh] w-[50vw] bg-gray-800 p-2 text-white"
      v-model="text"
    ></textarea>
    <div class="mt-4 flex items-center gap-2 bg-gray-700 p-2 text-gray-400">
      <div>Upload image:</div>
      <input type="file" ref="fileInput" @input="handleFile" />
      <img
        v-if="fileName"
        class="w-16"
        :src="`/api/media/${fileName}`"
        :alt="fileName"
      />
    </div>
  </div>
</template>
