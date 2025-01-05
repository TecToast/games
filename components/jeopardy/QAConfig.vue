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
function prepareUpload() {
  const file = fileInput.value!.files![0];
  if (!file) return;
  const formData = new FormData();
  formData.append("id", id.toString());
  formData.append("category", category.toString());
  formData.append("points", points.toString());
  formData.append("type", props.name);
  formData.append("file", file);
  $fetch<string>("/api/jeopardy/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      fileName.value = res;
    })
    .catch((err) => {
      console.error(err);
      alert(
        "An error occurred while uploading the file, please contact @tectoast.",
      );
    });
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
      <input type="file" ref="fileInput" @change="prepareUpload" />
      <img
        v-if="fileName"
        class="w-16"
        :src="`/api/jeopardy/media/${jeopardy.jdata?.host}/${id}/${toID(category.toString())}/${points.toString()}/${props.name}/${fileName}`"
        :alt="fileName"
      />
    </div>
  </div>
</template>
