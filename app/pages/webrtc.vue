<script lang="ts" setup>
const config = useRuntimeConfig();
const { data, send, status } = useWebSocket(
  `ws${config.public.host === "localhost:3000" ? "" : "s"}://${config.public.host}/api/webrtcserver`,
  { immediate: true, autoReconnect: true },
);
const input = ref<string>("");
const freeze = ref(false);
watch(input, (answer) => {
  send(JSON.stringify({ t: "a", m: answer}))
});
watch(data, (message) => {
  const msg = JSON.parse(message);
  if (msg.t === "f") {
    freeze.value = true;
  } else if (msg.t === "u") {
    freeze.value = false;
  }
});

const { user } = useUserSession();
</script>
<template>
  <div class="mt-16 flex w-full flex-col items-center justify-center gap-4">
    <h1 class="text-2xl text-gray-100">
      Eingabefeld für Quiz-Shows (angemeldet als {{ user?.name }})
    </h1>
    {{status}}
    <UTextarea
      v-model="input"
      class="w-1/2"
      autoresize
      :disabled="freeze"
    />
  </div>
</template>
