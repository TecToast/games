<script lang="ts" setup>
const { data: games } = await useFetch("/api/mygames")
const { user, fetch: fetchSession } = useUserSession();

async function loginAsDummy() {
  await $fetch("/api/auth/userswitch", { method: "POST", body: { name: "TestUser0" } });
  await fetchSession();
}
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
            <ControlButton :disabled="!user" :class="{ 'cursor-not-allowed': !user, '!bg-[#215f98]': !user }">
              {{ game.displayName }}
            </ControlButton>
          </NuxtLink>
        </div>
        <DevOnly>
          <div v-if="!user" class="flex flex-col items-center gap-4">
            <TextBox class="p-4">You are not logged in. Please choose:</TextBox>
            <div class="flex gap-4">
              <ControlButton @click="loginAsDummy()">
                Use dummy user
              </ControlButton>
              <NuxtLink to="/api/login" :external="true">
                <ControlButton>
                  Login with Discord
                </ControlButton>
              </NuxtLink>
            </div>
          </div>
        </DevOnly>
      </div>
    </div>
  </DefaultBackground>
</template>
