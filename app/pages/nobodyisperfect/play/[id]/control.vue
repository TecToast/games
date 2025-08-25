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
  rtcSend(JSON.stringify({ t: frozen ? "f" : "u" }));
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

const config = useRuntimeConfig();
const {
  data: rtcData,
  send: rtcSend,
  status: rtcStatus,
  open: rtcOpen,
} = useWebSocket(
  `ws${config.public.host === "localhost:3000" ? "" : "s"}://${config.public.host}/api/webrtcserver`,
);
rtcSend(JSON.stringify({ host: true }));
watch(rtcStatus, (status) => {
  if (status === "CLOSED") {
    rtcOpen();
    rtcSend(JSON.stringify({ host: true }));
  }
});
watch(rtcData, (message) => {
  const msg = JSON.parse(message);
  const userid = msg.userid;
  if (!answersFrozen.value) game.answers[userid] = msg.m;
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
            <UButton color="blue" @click="game.revealFromWhichUser(u)"
              >{{ getDisplayName(u) }}
            </UButton>
            <UButton @click="game.revealAnswerFromUser(u)" color="blue">👀</UButton>
            <UTextarea
              v-model="game.answers[u]"
              resize
              class="w-96"
            />
          </div>
          <div class="flex items-center gap-4 text-lg text-white">
            <UButton color="blue" @click="game.revealFromWhichUser('RICHTIG')"
              >RICHTIG
            </UButton>
            <UButton color="blue" @click="game.revealAnswerFromUser('RICHTIG')"
              >👀
            </UButton>
            <div
              class="cursor-pointer bg-gray-800"
            >
              {{
                gdata.questions?.[game.currentQuestionIndex]?.answer?.title ??
                "-"
              }}
            </div>
          </div>
          <UCheckbox v-model="answersFrozen" label="Antworten gefreezed" />
        </div>
        <div class="flex flex-col z-10">
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
                >Reset
              </ControlButton>
            </div>
          </template>
        </div>
      </div>
      <ConfigSep />
      <div class="ml-8 flex flex-col gap-4">
        <div class="text-gray-300">
          Aktuelle Frage:
          {{
            gdata.questions?.[game.currentQuestionIndex]?.question?.title ?? "-"
          }}
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
            >Next question
          </ControlButton>
          <ControlButton @click="resetAnswers()">Reset answers</ControlButton>
          <ControlButton @click="previousQuestion()"
            >Previous question
          </ControlButton>
        </div>
        <div class="flex items-center gap-2">
          <ControlButton
            @click="
              resetTimer();
              resume();
            "
            >Start timer from start
          </ControlButton>
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
            >Jump directly to answer screen
          </ControlButton>
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
