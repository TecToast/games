<script setup lang="ts">
const quiz = useMusicQuizStore();
const { gdata, users } = storeToRefs(quiz);
const { id } = useRoute().params;
const tracknum = ref("");
const yt = ref("");
const { data, status, sendWS } = useTypedWebsocket(
  process.env.NODE_ENV === "development"
    ? `ws://localhost:9934/api/musicquiz/ws/${id}`
    : `wss://games.tectoast.de/api/musicquiz/ws/${id}`,
);
watch(data, (newDataStr) => {
  const newData = JSON.parse(newDataStr);
  const type = newData.type;
  if (type == "Guess") {
    if (newData.user && newData.guess) {
      quiz.setGuess(newData.user, newData.guess);
    }
  } else if (type == "AllGuesses") {
    if (newData.guesses) {
      for (const [user, guess] of Object.entries(newData.guesses)) {
        quiz.setGuess(user, guess as string);
      }
    }
  }
});

function handleJumpToTrack() {
  const num = Number.parseInt(tracknum.value);
  if (!isNaN(num)) {
    jumpToTrack(num);
  } else {
    tracknum.value = "Keine gültige Nummer";
  }
}

function pause(soft: boolean) {
  sendWS("Pause", { soft });
}

function resume() {
  sendWS("Resume", {});
}

function restart() {
  sendWS("Restart", {});
}

function jumpToTrack(track: number) {
  const data = gdata.value;
  if (!data) return;
  const num = Math.min(Math.max(0, track - 1), data.tracks.length - 1);
  quiz.levelnum = num;
  quiz.revealReset();
  quiz.resetGuesses();
  playTrack(num);
}

function nextTrack() {
  const url = quiz.nextTrack();
  if (url) {
    sendWS("Play", { yt: url, clear: true });
  }
}

function joinVoice() {
  sendWS("Join", {});
}

function playTrack(track: number | string) {
  const data = gdata.value;
  if (!data) return;
  if (typeof track === "number") {
    const num = Math.min(Math.max(0, track), data.tracks.length - 1);
    const yt = data.tracks[num].url;
    sendWS("Play", { yt, clear: true });
  } else {
    sendWS("Play", { yt: track });
  }
}
</script>

<template>
  <DefaultBackground v-if="gdata">
    <div class="mt-8 flex">
      <div class="ml-8 flex w-full flex-col gap-4">
        <ControlButton class="w-1/4" @click="nextTrack()"
          >Next track
        </ControlButton>
        <ControlButton class="w-1/4" @click="pause(true)"
          >Soft Pause
        </ControlButton>
        <ControlButton class="w-1/4" @click="pause(false)"
          >Hard Pause
        </ControlButton>
        <ControlButton class="w-1/4" @click="resume()">Resume</ControlButton>
        <ControlButton class="w-1/4" @click="restart()">Restart</ControlButton>
        <div class="my-8 flex gap-2">
          <input
            class="h-12 w-16 bg-gray-800 p-4 text-gray-200"
            v-model="tracknum"
          />
          <ControlButton @click="handleJumpToTrack"
            >Jump to track
          </ControlButton>
        </div>
        <div class="flex flex-col gap-2">
          <input
            class="h-12 w-1/2 bg-gray-800 p-4 text-gray-200"
            v-model="yt"
          />
          <ControlButton class="w-1/5" @click="playTrack(yt)"
            >YT-Link
          </ControlButton>
        </div>
        <div class="align-center mt-16 flex w-1/4 content-center gap-4">
          <ControlButton @click="joinVoice()"
            >Join Voice & Connect
          </ControlButton>
          <ClientOnly>
            {{ status }}
          </ClientOnly>
        </div>
        <NuxtLink
          target="_blank"
          :to="`/musicquiz/play/${id}/main`"
          class="mt-24"
        >
          <ControlButton class="bg-cyan-600 p-2">
            Open main page to stream
          </ControlButton>
        </NuxtLink>
        <NuxtLink :to="`/musicquiz/config/${id}`">
          <ControlButton class="bg-red-900 p-2"> Back to config</ControlButton>
        </NuxtLink>
      </div>
      <div class="-ml-8 flex w-full flex-col gap-8">
        <div class="flex gap-2">
          <ControlButton class="w-1/4" @click="quiz.revealAll()"
            >Reveal all users
          </ControlButton>
          <ControlButton class="w-1/4" @click="quiz.revealReset()"
            >Reveal reset
          </ControlButton>
        </div>
        <div v-for="user of users.list" class="flex flex-col gap-2">
          <div class="whitespace-pre-wrap text-white">
            {{ users.data[user].guess }}
          </div>
          <div class="flex gap-2">
            <ControlButton @click="quiz.revealUser(user)">
              Reveal {{ users.data[user].displayName }}
            </ControlButton>
            <ControlButton
              v-for="i of ['+3', '+2', '+1', '-1']"
              @click="quiz.addPoints(user, Number.parseInt(i))"
              >{{ i }}
            </ControlButton>
          </div>
        </div>
        <ControlButton class="mt-16 w-1/4" @click="quiz.revealed = true"
          >Reveal Track
        </ControlButton>
      </div>
    </div>
  </DefaultBackground>
</template>
