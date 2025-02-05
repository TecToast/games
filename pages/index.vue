<script lang="ts" setup>
const { data: games } = await useFetch("/api/mygames")
</script>

<template>
  <DefaultBackground class="flex flex-col items-center">
    <div class="mt-4 flex flex-col items-center">
      <TextBox v-if="!games || games.length === 0" class="p-4">You don't have permission to access a game.</TextBox>
      <div v-else class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2">
          <TextBox class="p-4 text-2xl">Your games:</TextBox>
          <HelpModal name="General overview">
            Here you can see all the games you have access to. Click on a game
            to continue.
          </HelpModal>
        </div>
        <div class="flex flex-col items-center gap-4">
          <NuxtLink v-for="game of games" :key="game.displayName" :to="game.url">
            <ControlButton>
              {{ game.displayName }}
            </ControlButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </DefaultBackground>
</template>
