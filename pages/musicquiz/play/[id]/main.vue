<script setup lang="ts">
const music = useMusicQuizStore();
const { users, revealed, gamemode, currentSongNumber, currentSongData } =
  storeToRefs(music);
</script>

<template>
  <div
    style="background-image: linear-gradient(#8902c7, #4402c7)"
    class="flex min-h-screen flex-col content-between justify-around"
    v-if="users"
  >
    <div class="flex min-h-[20vh] flex-col justify-center">
      <div class="flex min-w-full content-center justify-around">
        <TextBox
          class="flex h-12 min-w-64 items-center justify-center border border-gray-800 px-4 !text-3xl"
        >
          {{ gamemode }}
        </TextBox>
      </div>
      <div class="mt-4 flex min-w-full content-center justify-around">
        <TextBox class="min-w-40 !text-3xl">
          {{ currentSongNumber }}
        </TextBox>
      </div>
      <div class="mt-4 flex content-center justify-center">
        <div
          class="h-28 w-max min-w-[50vw] max-w-[50vw] content-center overflow-auto whitespace-pre-line text-wrap rounded bg-[#828282] py-2 text-center text-3xl font-semibold leading-10 tracking-wide"
        >
          {{ revealed ? currentSongData : ":)" }}
        </div>
      </div>
    </div>
    <div
      class="mt-4 flex min-h-[50vh] min-w-full content-center justify-around"
    >
      <div
        class="flex flex-col items-center justify-around"
        v-for="user of users.list"
      >
        <TextBox class="px-4">{{ users.data[user].points }}</TextBox>
        <img
          class="w-52 rounded-full"
          :src="users.data[user].avatarUrl"
          :alt="user"
        />
        <div class="mt-4 flex content-center justify-center">
          <div
            class="h-20 w-max min-w-64 max-w-64 overflow-auto whitespace-pre-line text-wrap rounded bg-[#828282] py-2 text-center !text-2xl"
          >
            {{
              users.data[user].visible
                ? users.data[user].guess
                : users.data[user].guess == "..."
                  ? "...\n..."
                  : "***\nSpiel: ***"
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
