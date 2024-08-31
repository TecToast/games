<script setup lang="ts">
const quiz = useMusicQuizStore();
const { gdata, users } = storeToRefs(quiz);
const { id } = useRoute().params;
const tracknum = ref("");
const yt = ref("");
function handleJumpToTrack() {
  const num = Number.parseInt(tracknum.value);
  if (!isNaN(num)) {
    quiz.jumpToTrack(num);
  } else {
    tracknum.value = "Keine gültige Nummer";
  }
}
</script>

<template>
  <DefaultBackground v-if="gdata">
    <div class="mt-8 flex">
      <div class="ml-8 flex w-full flex-col gap-4">
        <ControlButton class="w-1/4" @click="quiz.nextTrack()"
          >Next track</ControlButton
        >
        <ControlButton class="w-1/4" @click="quiz.pause()">Pause</ControlButton>
        <ControlButton class="w-1/4" @click="quiz.resume()"
          >Resume</ControlButton
        >
        <ControlButton class="w-1/4" @click="quiz.restart()"
          >Restart</ControlButton
        >
        <div class="my-8 flex gap-2">
          <input
            class="h-12 w-16 bg-gray-800 p-4 text-gray-200"
            v-model="tracknum"
          />
          <ControlButton @click="handleJumpToTrack"
            >Jump to track</ControlButton
          >
        </div>
        <div class="flex flex-col gap-2">
          <input
            class="h-12 w-1/2 bg-gray-800 p-4 text-gray-200"
            v-model="yt"
          />
          <ControlButton class="w-1/5" @click="quiz.playTrack(yt)"
            >YT-Link</ControlButton
          >
        </div>
        <NuxtLink
          target="_blank"
          :to="`/musicquiz/play/${id}/main`"
          class="mt-32"
        >
          <ControlButton class="bg-cyan-600 p-2">
            Open main page to stream
          </ControlButton>
        </NuxtLink>
        <NuxtLink :to="`/musicquiz/config/${id}`">
          <ControlButton class="bg-red-900 p-2"> Back to config </ControlButton>
        </NuxtLink>
      </div>
      <div class="-ml-8 flex w-full flex-col gap-8">
        <div class="flex gap-2">
          <ControlButton class="w-1/4" @click="quiz.revealAll()"
            >Reveal all users</ControlButton
          >
          <ControlButton class="w-1/4" @click="quiz.revealReset()"
            >Reveal reset</ControlButton
          >
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
              >{{ i }}</ControlButton
            >
          </div>
        </div>
        <ControlButton class="mt-16 w-1/4" @click="quiz.revealed = true"
          >Reveal Track</ControlButton
        >
      </div>
    </div>
  </DefaultBackground>
</template>
