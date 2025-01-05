<script lang="ts" setup>
import { AnswerState } from "~/utils/jeopardy/types";

const game = useNobodyIsPerfectStore();
const {
  gdata,
  users,
  answers,
  totalAnswerCount,
  userCount,
  currentQuestionIndex,
} = storeToRefs(game);
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

const { data, status, sendWS } = useTypedWebsocket(
  process.env.NODE_ENV === "development"
    ? `ws://localhost:9934/api/nobodyisperfect/ws/${id}`
    : `wss://games.tectoast.de/api/nobodyisperfect/ws/${id}`,
);
watch(data, (newDataStr) => {
  const newData = JSON.parse(newDataStr);
  const type = newData.type;
  if (type == "Answer") {
    game.answers[newData.user] = newData.answer;
  } else if (type == "AllAnswers") {
    game.answers = newData.answers;
  }
});
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

function acceptAnswers(state: boolean, deleteAnswers = false) {
  sendWS("AcceptAnswers", { state, deleteAnswers });
}

function resetAnswers() {
  game.answers = {};
  game.revealedAnswers = [];
  acceptAnswers(true, true);
}
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
              >{{ users!.data[u].displayName }}
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
            <ControlButton @click="acceptAnswers(false)">FREEZE</ControlButton>
            <ControlButton @click="acceptAnswers(true)">UNFREEZE</ControlButton>
          </div>
        </div>
        <div class="flex flex-col">
          <template v-for="u of users!.list" class="flex gap-4">
            <div class="mt-8 text-lg text-white">
              {{ users!.data[u].displayName }}
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
        <div class="flex gap-2">
          <ControlButton
            @click="
              resetTimer();
              game.state = 'question';
            "
            >Reveal Question
          </ControlButton>
          <ControlButton
            @click="
              sendWS('PlayTrackOfQuestion', {
                questionIndex: currentQuestionIndex,
              })
            "
            v-if="qData"
            :disabled="!qData.question.audio"
            :class="{ 'bg-gray-800': !qData.question.audio }"
            >Play track of question
          </ControlButton>
          <ControlButton
            @click="
              sendWS('PlayTrackOfAnswer', {
                questionIndex: currentQuestionIndex,
              })
            "
            v-if="qData"
            :disabled="!qData.answer.audio"
            :class="{ 'bg-gray-800': !qData.answer.audio }"
            >Play track of answer
          </ControlButton>
          <ControlButton
            @click="sendWS('StopTrack', {})"
            v-if="qData"
            :disabled="!qData.question.audio"
            :class="{ 'bg-gray-800': !qData.question.audio }"
            >Pause track
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
          <ControlButton @click="game.switchToAnswerScreen()">Jump directly to answer screen</ControlButton>
        </div>
        <div class="flex items-center gap-2">
          <UInput
            size="md"
            label="hey"
            color="blue"
            v-model="ytLink"
          />
          <UButton @click="sendWS('PlayYT', {yt: ytLink})" label="YT-Link abspielen" color="blue" />
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
        <ControlButton @click="sendWS('Join', {})" class="bg-orange-700 p-2"
          >Connect with Quiz-Gon Jinn</ControlButton
        >
        <NuxtLink :to="`/nobodyisperfect/config/${id}`">
          <ControlButton class="bg-red-900 p-2"> Back to config</ControlButton>
        </NuxtLink>
      </div>
    </div>
  </DefaultBackground>
</template>
