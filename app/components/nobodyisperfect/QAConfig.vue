<script lang="ts" setup>
const props = defineProps<{
  name: string;
}>();

const text = defineModel("text", { type: String });
const fileName = defineModel("file", { type: String });
const audioUrl = defineModel("audio", { type: String });
const fileInput = ref<HTMLInputElement | null>(null);
const { handleFileInput, files } = useFileStorage({ clearOldFiles: true });
async function handleFile(event: Event) {
  await handleFileInput(event);
  if (files.value.length > 0) {
    fileName.value = await $fetch<string>("/api/upload", {
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
      v-model="text"
      class="mt-4 h-[10vh] w-[50vw] bg-gray-800 p-2 text-white"
    />
    <input
      v-model="audioUrl"
      class="mt-4 h-8 bg-gray-800 p-2 text-white"
      type="text"
      placeholder="YT-URL"
    />
    <div class="mt-4 flex items-center gap-2 bg-gray-700 p-2 text-gray-400">
      <div>Upload image/video:</div>
      <input ref="fileInput" type="file" @input="handleFile" />

      <img
        v-if="fileName && !fileName.endsWith('mp4')"
        class="w-16"
        :src="`/api/media/${fileName}`"
        :alt="fileName"
      />
      <video v-if="fileName && fileName.endsWith('mp4')" controls class="w-64">
        <source :src="`/api/media/${fileName}`" type="video/mp4" />
      </video>
      <UButton v-if="fileName" color="red" @click="fileName = undefined"
        >Delete media</UButton
      >
    </div>
  </div>
</template>
