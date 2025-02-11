<script lang="ts" setup>

const game = useNobodyIsPerfectStore();
const { gdata, users, totalAnswerCount, currentQuestionIndex } =
  storeToRefs(game);
const qData = computed(
  () => gdata.value?.questions[currentQuestionIndex.value],
);
const { id } = useRoute().params;

const answerMediaOptions = [
  { value: "nothing", label: "Nichts" },
  {
    value: "question",
    label: "Frage",
  },
  { value: "answer", label: "Antwort" },
];
const ytLink = ref("");
const { pause, resume } = useIntervalFn(
  () => {
    if (game.timer > 0) {
      game.timer--;
      if (game.timer == 0) {
        game.switchToAnswerScreen();
      }
    }
  },
  1000,
  { immediate: false },
);

function resetTimer() {
  pause();
  game.timer = game.timerStart;
}

function acceptAnswers(state: boolean, deleteAnswers = false, saveIndex = -1) {
  // TODO
}

function resetAnswers() {
  game.answers = {};
  game.revealedAnswers = [];
  acceptAnswers(true, true, currentQuestionIndex.value);
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}


const peers: { [k: string]: RTCPeerConnection } = {};
const sendChannels: { [k: string]: RTCDataChannel } = {};
const config = useRuntimeConfig();
const { data: rtcData, send: rtcSend } = useWebSocket(`wss://${config.public.host}/api/webrtcserver`)
rtcSend(JSON.stringify({ host: true }))
watch(rtcData, message => {
  console.log(message)
  const msg = JSON.parse(message);
  console.log("parsing succeeded")
  const userid = msg.userid;
  if (!peers[userid]) {
    peers[userid] = new RTCPeerConnection(peerConnectionConfig)
    peers[userid].onicecandidate = (event) => {
      if (event.candidate) {
        rtcSend(JSON.stringify({
          to: userid,
          ice: event.candidate,
        }))
      }
    }
    peers[userid].ondatachannel = (event) => {
      const dataChannel = event.channel
      dataChannel.onmessage = (event) => {
        game.answers[userid] = event.data
      }
    }
    sendChannels[userid] = peers[userid].createDataChannel("sendChannel")
  }
  const peer = peers[userid];
  if (msg.sdp) {
    peer.setRemoteDescription(new RTCSessionDescription(msg.sdp)).then(() => {
      peer.createAnswer().then((answer) => {
        peer.setLocalDescription(answer).then(() => {
          rtcSend(JSON.stringify({
            to: userid,
            sdp: answer,
          }))
        })
      })
    })
  } else if (msg.ice) {
    peer.addIceCandidate(new RTCIceCandidate(msg.ice))
  }
})
</script>

<template>
  <DefaultBackground v-if="gdata">
    <div class="flex flex-col justify-around">
      <div class="flex justify-around">
        <div class="mt-10 flex flex-col gap-4">
          <div
            class="flex items-center gap-4 text-lg text-white"
            v-for="u of users!.list"
          >
            <ControlButton @click="game.revealFromWhichUser(u)"
              >{{ getDisplayName(u) }}
            </ControlButton>
            <div
              @click="game.revealAnswerFromUser(u)"
              class="cursor-pointer bg-gray-800"
            >
              {{ game.answers[u] ?? "-" }}
            </div>
          </div>
          <div class="flex items-center gap-4 text-lg text-white">
            <ControlButton @click="game.revealFromWhichUser('RICHTIG')"
              >RICHTIG
            </ControlButton>
            <div
              @click="game.revealAnswerFromUser('RICHTIG')"
              class="cursor-pointer bg-gray-800"
            >
              {{ gdata.questions[game.currentQuestionIndex].answer.title }}
            </div>
          </div>
          <div class="flex">
            <ControlButton
              @click="acceptAnswers(false, false, currentQuestionIndex)"
              >FREEZE</ControlButton
            >
            <ControlButton @click="acceptAnswers(true)">UNFREEZE</ControlButton>
          </div>
        </div>
        <div class="flex flex-col">
          <template v-for="u of users!.list" class="flex gap-4">
            <div class="mt-8 text-lg text-white">
              {{ getDisplayName(u) }}
            </div>
            <div class="flex gap-2">
              <ControlButton @click="game.addPointsToUser(u, 1)"
                >+1
              </ControlButton>
              <ControlButton @click="game.addPointsToUser(u, -1)" class="mr-4"
                >-1
              </ControlButton>
              <ControlButton
                class="!min-w-12 max-w-12"
                v-for="num in totalAnswerCount"
                @click="game.selectAnswerForUser(u, num - 1)"
              >
                {{ String.fromCharCode(num + 96) }}
              </ControlButton>
              <ControlButton
                @click="game.selectAnswerForUser(u, totalAnswerCount)"
                >Reset</ControlButton
              >
            </div>
          </template>
        </div>
      </div>
      <ConfigSep />
      <div class="ml-8 flex flex-col gap-4">
        <div class="text-gray-300">
          Aktuelle Frage:
          {{ gdata.questions[game.currentQuestionIndex].question.title }}
        </div>
        <div class="flex gap-2">
          <ControlButton
            @click="
              resetTimer();
              game.state = 'question';
            "
            >Reveal Question
          </ControlButton>
        </div>
        <URadioGroup
          color="blue"
          v-model="game.answerMediaState"
          legend="Welche Media soll auf der Antwortenseite angezeigt werden?"
          :options="answerMediaOptions"
        />
        <div class="flex gap-2">
          <ControlButton
            @click="
              resetAnswers();
              game.nextQuestion();
            "
            >Next question</ControlButton
          >
          <ControlButton @click="resetAnswers()">Reset answers</ControlButton>
          <ControlButton @click="previousQuestion()"
            >Previous question</ControlButton
          >
        </div>
        <div class="flex items-center gap-2">
          <ControlButton
            @click="
              resetTimer();
              resume();
            "
            >Start timer from start</ControlButton
          >
          <UInput
            size="2xs"
            type="number"
            label="hey"
            color="blue"
            v-model="game.timerStart"
          />
          <ControlButton @click="pause()">Stop timer</ControlButton>
          <ControlButton @click="resume()">Resume timer</ControlButton>
          <ControlButton @click="resetTimer()">Reset timer</ControlButton>
          <ControlButton
            @click="
              pause();
              game.switchToAnswerScreen();
            "
            >Jump directly to answer screen</ControlButton
          >
        </div>
      </div>
    </div>
    <div class="ml-8 mr-4 mt-12 flex justify-between">
      <div class="flex gap-2">
        <NuxtLink target="_blank" :to="`/nobodyisperfect/play/${id}/main`">
          <ControlButton class="bg-cyan-600 p-2">
            Open main page to stream
          </ControlButton>
        </NuxtLink>
        <NuxtLink :to="`/nobodyisperfect/config/${id}`">
          <ControlButton class="bg-red-900 p-2"> Back to config</ControlButton>
        </NuxtLink>
      </div>
    </div>
  </DefaultBackground>
</template>
