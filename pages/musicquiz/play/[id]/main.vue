<script setup lang="ts">

const music = useMusicQuizStore()
</script>

<template>
  <div style="background-image: linear-gradient(#8902c7, #4402c7);"
       class="min-h-screen flex flex-col justify-center content-around">
    <div class="flex flex-col justify-center min-h-[20vh]">
      <div class="flex justify-around content-center min-w-full">
        <TextBox
            class="flex justify-center items-center text-wrap min-w-64 px-4 overflow-auto border border-gray-800">
          {{
            music.revealed ? music.gamemode : ':)'
          }}
        </TextBox>
      </div>
      <div class="flex justify-around content-center min-w-full mt-4">
        <TextBox class="min-w-40">
          {{
            music.currentSongText
          }}
        </TextBox>
      </div>
      <div class="flex justify-center content-center mt-4">
        <div
            class="font-semibold text-center w-max rounded py-2 tracking-wide bg-[#828282] min-w-[50vw] max-w-[50vw] h-28 content-center text-wrap overflow-auto whitespace-pre-line leading-10 text-3xl">
          {{ music.revealed ? music.currentSongText : 'Title Screen\nB2W2' }}
        </div>
      </div>
    </div>
    <div class="flex justify-around content-center min-w-full mt-4">

    </div>
  </div>
</template>

<style scoped>

</style>
