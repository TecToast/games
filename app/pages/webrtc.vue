<script lang="ts" setup>
import { peerConnectionConfig } from "~/utils/webrtc";
const config = useRuntimeConfig();
const { data, send, open } = useWebSocket(
  `ws${config.public.host === "localhost:3000" ? "" : "s"}://${config.public.host}/api/webrtcserver`,
  { immediate: false },
);
const input = ref<string>("");
const peerConnection: Ref<RTCPeerConnection | null> = ref(null);
const sendChannel: Ref<RTCDataChannel | null> = ref(null);
const freeze = ref(false);
const connectionState = ref<"Connect" | "Connecting..." | "Connected!">(
  "Connect",
);
watch(input, (answer) => {
  sendChannel.value?.send(answer);
});
function connect() {
  connectionState.value = "Connecting...";
  open();
  const conn = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.value = conn;
  conn.onicecandidate = (event) => {
    if (event.candidate) {
      send(
        JSON.stringify({
          ice: event.candidate,
        }),
      );
    }
  };
  conn.createOffer().then((offer) => {
    conn!.setLocalDescription(offer).then(() => {
      send(
        JSON.stringify({
          sdp: offer,
        }),
      );
    });
  });
  sendChannel.value = conn.createDataChannel("sendChannel");
  sendChannel.value.onopen = () => {
    connectionState.value = "Connected!";
  };
  sendChannel.value.onclose = () => {
    connectionState.value = "Connect";
  };
  sendChannel.value.onmessage = (event) => {
    console.log(event.data);
    freeze.value = event.data === "FROZEN";
  };
}
watch(data, (message) => {
  const msg = JSON.parse(message);
  if (msg.reconnect) {
    connect();
  }
  if (!peerConnection.value) {
    console.log("No peer connection");
    return;
  }
  if (msg.sdp) {
    peerConnection.value!.setRemoteDescription(
      new RTCSessionDescription(msg.sdp),
    );
  } else if (msg.ice) {
    peerConnection.value!.addIceCandidate(new RTCIceCandidate(msg.ice));
  }
});

const { user } = useUserSession();
</script>
<template>
  <div class="mt-16 flex w-full flex-col items-center justify-center gap-4">
    <h1 class="text-2xl text-gray-100">
      Eingabefeld für Quiz-Shows (angemeldet als {{ user?.name }})
    </h1>
    <UButton
      :disabled="connectionState != 'Connect'"
      :loading="connectionState == 'Connecting...'"
      @click="connect()"
      >{{ connectionState }}</UButton
    >
    <UTextarea
      v-model="input"
      class="w-1/2"
      autoresize
      :disabled="freeze || connectionState != 'Connected!'"
    />
  </div>
</template>
