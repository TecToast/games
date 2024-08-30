<script lang="ts" setup>
const auth = useAuthStore();
const { status, data } = storeToRefs(auth);
await until(status).not.toBe("pending");
</script>

<template>
  <DefaultBackground class="flex flex-col items-center">
    <TextBox v-if="status === 'error'" class="mt-4 p-4"
      >Unknown error occured.</TextBox
    >
    <div v-else class="mt-4 flex flex-col items-center">
      <TextBox v-if="!data?.length" class="p-4"
        >You don't have permission to access a game.</TextBox
      >
      <div v-else class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2">
          <TextBox class="p-4 text-2xl">Your games:</TextBox>
          <HelpModal name="General overview">
            Here you can see all the games you have access to. Click on a game
            to continue.
          </HelpModal>
        </div>
        <div class="flex flex-col gap-4">
          <NuxtLink v-for="game of data" :key="game.displayName" :to="game.url">
            <ControlButton>
              {{ game.displayName }}
            </ControlButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </DefaultBackground>
</template>
