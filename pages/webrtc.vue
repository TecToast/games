<script lang="ts" setup>
import { peerConnectionConfig } from '~/utils/webrtc';

const { data, send } = useWebSocket("wss://games.tectoast.de/webrtcserver")
const userid = ref<string>("")
const input = ref<string>("")
const peerConnection: Ref<RTCPeerConnection | null> = ref(null)
let sendChannel: Ref<RTCDataChannel | null> = ref(null)
watch(input, answer => {
  sendChannel.value?.send(answer)
})
function connect() {
  const conn = new RTCPeerConnection(peerConnectionConfig)
  peerConnection.value = conn
  conn.onicecandidate = (event) => {
    if (event.candidate) {
      send(JSON.stringify({
        userid: userid.value,
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
        userid: userid.value,
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
</script>

<template>
  <div>
    <h1>WebRTC</h1>
    <input v-model="userid" />
    <button @click="connect()">Connect</button>
    <textarea v-model="input" />
  </div>
</template>