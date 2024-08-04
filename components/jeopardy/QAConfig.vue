<script lang="ts" setup>
const props = defineProps<{
  name: string
}>()

const route = useRoute();
const { id, category, points } = route.params;
const jeopardy = useJeopardyStore();

const text = defineModel('text', { type: String })
const fileName = defineModel('file', { type: String })
const fileInput = ref<HTMLInputElement | null>(null)
function prepareUpload() {
  const file = fileInput.value!.files![0]
  const formData = new FormData()
  formData.append("path", `${id}/${category}/${points}/${props.name}`)
  formData.append("file", file)
  $fetch<string>("/api/jeopardy/upload", {
    method: "POST",
    body: formData
  }).then((res) => {
    fileName.value = res
  })
}
</script>

<template>
  <div class="flex flex-col">
    <div class="text-gray-300 font-bold text-3xl text-center mt-4">{{ props.name }}:</div>
    <textarea class="w-[50vw] h-[10vh] bg-gray-800 text-white p-2 mt-4" v-model="text"></textarea>
    <div class="flex items-center gap-2 mt-4 bg-gray-700 p-2 text-gray-400">
      <div>Upload image:</div>
      <input type="file" ref="fileInput" @change="prepareUpload" />
    </div>
  </div>
</template>