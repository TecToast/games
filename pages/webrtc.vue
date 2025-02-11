<script lang="ts" setup>
import { peerConnectionConfig } from '~/utils/webrtc';
const config = useRuntimeConfig();
const { data, send } = useWebSocket(`wss://${config.public.host}/api/webrtcserver`)
const input = ref<string>("")
const peerConnection: Ref<RTCPeerConnection | null> = ref(null)
let sendChannel: Ref<RTCDataChannel | null> = ref(null)
watch(input, answer => {
  sendChannel.value?.send(answer)
})
function connect() {
  send(JSON.stringify({
    auth: true,
  }))
  const conn = new RTCPeerConnection(peerConnectionConfig)
  peerConnection.value = conn
  conn.onicecandidate = (event) => {
    if (event.candidate) {
      send(JSON.stringify({
        ice: event.candidate,
      }))
    }
  }
  conn.ondatachannel = (event) => {
    const dataChannel = event.channel
    dataChannel.onmessage = (event) => {
      console.log(event.data)
    }
  }
  sendChannel.value = conn.createDataChannel("sendChannel")
  conn.createOffer().then((offer) => {
    conn!.setLocalDescription(offer).then(() => {
      send(JSON.stringify({
        sdp: offer,
      }))
    })
  })
}
watch(data, message => {
  const msg = JSON.parse(message)
  if (msg.reconnect) {
    connect()
  }
  if (!peerConnection.value) {
    console.log("No peer connection")
    return
  }
  if (msg.sdp) {
    peerConnection.value!.setRemoteDescription(new RTCSessionDescription(msg.sdp))
  } else if (msg.ice) {
    peerConnection.value!.addIceCandidate(new RTCIceCandidate(msg.ice))
  }
})

const {user} = useUserSession()
</script>
<template>
  <div class="w-full flex flex-col justify-center items-center mt-16 gap-4">
    <h1 class="text-2xl text-gray-100">Eingabefeld für Quiz-Shows (angemeldet als {{ user?.name }})</h1>
    <UButton @click="connect()">Connect</UButton>
    <UTextarea v-model="input" class="w-1/2" autoresize />
  </div>
</template>