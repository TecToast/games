<script lang="ts" setup>
import type { PerfectAnswersRequest } from "~/utils/nobodyisperfect/messages";

const game = useNobodyIsPerfectStore();
const { gdata, totalAnswerCount, currentQuestionIndex } = storeToRefs(game);
const { id } = useRoute().params;
const answersFrozen = ref(false);

const answerMediaOptions = [
  { value: "nothing", label: "Nichts" },
  {
    value: "question",
    label: "Frage",
  },
  { value: "answer", label: "Antwort" },
];
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

watch(answersFrozen, freezeAnswers);

async function freezeAnswers(frozen: boolean) {
  Object.values(sendChannels).forEach((channel) => {
    channel.send(frozen ? "FROZEN" : "FREE");
  });
  const data = gdata.value;
  if (frozen && data) {
    await $fetch("/api/perfectanswers", {
      method: "POST",
      body: {
        host: data.host,
        answers: game.answers,
        gameID: data.id,
        questionIndex: currentQuestionIndex.value,
      } satisfies PerfectAnswersRequest,
    });
  }
}

function resetAnswers() {
  game.answers = {};
  game.revealedAnswers = [];
  freezeAnswers(true);
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}

const peers: { [k: string]: RTCPeerConnection } = {};
const sendChannels: { [k: string]: RTCDataChannel } = {};
const config = useRuntimeConfig();
const { data: rtcData, send: rtcSend } = useWebSocket(
  `wss://${config.public.host}/api/webrtcserver`,
);
rtcSend(JSON.stringify({ host: true }));
watch(rtcData, (message) => {
  console.log(message);
  const msg = JSON.parse(message);
  console.log("parsing succeeded");
  const userid = msg.userid;
  if (!peers[userid]) {
    peers[userid] = new RTCPeerConnection(peerConnectionConfig);
    peers[userid].onicecandidate = (event) => {
      if (event.candidate) {
        rtcSend(
          JSON.stringify({
            to: userid,
            ice: event.candidate,
          }),
        );
      }
    };
    peers[userid].ondatachannel = (event) => {
      const dataChannel = event.channel;
      sendChannels[userid] = dataChannel;
      dataChannel.onmessage = (event) => {
        if (!answersFrozen.value) game.answers[userid] = event.data;
      };
    };
  }
  const peer = peers[userid];
  if (msg.sdp) {
    peer.setRemoteDescription(new RTCSessionDescription(msg.sdp)).then(() => {
      peer.createAnswer().then((answer) => {
        peer.setLocalDescription(answer).then(() => {
          rtcSend(
            JSON.stringify({
              to: userid,
              sdp: answer,
            }),
          );
        });
      });
    });
  } else if (msg.ice) {
    peer.addIceCandidate(new RTCIceCandidate(msg.ice));
  }
});
</script>

<template>
  <DefaultBackground v-if="gdata">
    <div class="flex flex-col justify-around">
      <div class="flex justify-around">
        <div class="mt-10 flex flex-col gap-4">
          <div
            v-for="u of gdata.participantsList"
            :key="u"
            class="flex items-center gap-4 text-lg text-white"
          >
            <ControlButton @click="game.revealFromWhichUser(u)"
              >{{ getDisplayName(u) }}
            </ControlButton>
            <div
              class="cursor-pointer bg-gray-800"
              @click="game.revealAnswerFromUser(u)"
            >
              {{ game.answers[u] ?? "-" }}
            </div>
          </div>
          <div class="flex items-center gap-4 text-lg text-white">
            <ControlButton @click="game.revealFromWhichUser('RICHTIG')"
              >RICHTIG
            </ControlButton>
            <div
              class="cursor-pointer bg-gray-800"
              @click="game.revealAnswerFromUser('RICHTIG')"
            >
              {{ gdata.questions[game.currentQuestionIndex].answer.title }}
            </div>
          </div>
          <UCheckbox v-model="answersFrozen" label="Antworten gefreezed" />
        </div>
        <div class="flex flex-col">
          <template v-for="u of gdata!.participantsList" :key="u">
            <div class="mt-8 text-lg text-white">
              {{ getDisplayName(u) }}
            </div>
            <div class="flex gap-2">
              <ControlButton @click="game.addPointsToUser(u, 1)"
                >+1
              </ControlButton>
              <ControlButton class="mr-4" @click="game.addPointsToUser(u, -1)"
                >-1
              </ControlButton>
              <ControlButton
                v-for="num in totalAnswerCount"
                :key="num"
                class="!min-w-12 max-w-12"
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
          v-model="game.answerMediaState"
          color="blue"
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
            v-model="game.timerStart"
            size="2xs"
            type="number"
            label="hey"
            color="blue"
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
