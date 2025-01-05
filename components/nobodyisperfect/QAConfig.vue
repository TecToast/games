<script lang="ts" setup>
const props = defineProps<{
  name: string;
}>();

const route = useRoute();
const { id, num } = route.params;
const game = useNobodyIsPerfectStore();

const text = defineModel("text", { type: String });
const fileName = defineModel("file", { type: String });
const audioUrl = defineModel("audio", { type: String });
const fileInput = ref<HTMLInputElement | null>(null);

function prepareUpload() {
  const file = fileInput.value!.files![0];
  if (!file) return;
  const formData = new FormData();
  formData.append("id", id.toString());
  formData.append("num", num.toString());
  formData.append("type", props.name);
  formData.append("file", file);
  $fetch<string>("/api/nobodyisperfect/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      console.log("Setting filename to ", res)
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
    <input
      class="mt-4 h-8 bg-gray-800 p-2 text-white"
      type="text"
      placeholder="YT-URL"
      v-model="audioUrl"
    />
    <div class="mt-4 flex items-center gap-2 bg-gray-700 p-2 text-gray-400">
      <div>Upload image/video:</div>
      <input type="file" ref="fileInput" @change="prepareUpload" />

      <img
        v-if="fileName && !fileName.endsWith('mp4')"
        class="w-16"
        :src="`/api/nobodyisperfect/media/${game.gdata?.host}/${id}/${toID(num.toString())}/${props.name}/${fileName}`"
        :alt="fileName"
      />
      <video controls v-if="fileName && fileName.endsWith('mp4')" class="w-64">
        <source
          :src="`/api/nobodyisperfect/media/${game.gdata?.host}/${id}/${toID(num.toString())}/${props.name}/${fileName}`"
          type="video/mp4"
        />
      </video>
    </div>
  </div>
</template>
