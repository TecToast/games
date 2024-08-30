<script setup lang="ts">
const music = useMusicQuizStore();
</script>

<template>
  <div
    style="background-image: linear-gradient(#8902c7, #4402c7)"
    class="flex min-h-screen flex-col content-around justify-center"
  >
    <div class="flex min-h-[20vh] flex-col justify-center">
      <div class="flex min-w-full content-center justify-around">
        <TextBox
          class="flex min-w-64 items-center justify-center overflow-auto text-wrap border border-gray-800 px-4"
        >
          {{ music.revealed ? music.gamemode : ":)" }}
        </TextBox>
      </div>
      <div class="mt-4 flex min-w-full content-center justify-around">
        <TextBox class="min-w-40">
          {{ music.currentSongText }}
        </TextBox>
      </div>
      <div class="mt-4 flex content-center justify-center">
        <div
          class="h-28 w-max min-w-[50vw] max-w-[50vw] content-center overflow-auto whitespace-pre-line text-wrap rounded bg-[#828282] py-2 text-center text-3xl font-semibold leading-10 tracking-wide"
        >
          {{ music.revealed ? music.currentSongText : "Title Screen\nB2W2" }}
        </div>
      </div>
    </div>
    <div class="mt-4 flex min-w-full content-center justify-around"></div>
  </div>
</template>

<style scoped></style>
