<script setup lang="ts">
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { watchWizard } from "~/utils/wsutils";
import type { OpenGamesData } from "~/utils/wizard/types";

definePageMeta({
  keepalive: true,
});

const { user, fetch: fetchSession } = useUserSession();

const { data: wsData, sendWS } = useWizardConnection();
const openGames = useState<OpenGamesData>("openGames");
preloadRouteComponents("/wizard/game/:id");

function createGame() {
  sendWS({ type: "CreateGame" });
}
watchWizard(wsData, "GameCreated", (d) => {
  navigateTo(`/wizard/game/${d.gameID}`);
});
async function devSwitchUser(name: string) {
  await $fetch("/api/auth/userswitch", { method: "POST", body: { name } });
  await fetchSession();
}
</script>
<template>
  <DefaultBackground>
    <DevOnly>
      <div class="absolute left-2 top-2 flex gap-3">
        <ControlButton v-for="name of ['TestUser1', 'TestUser2', 'TestUser3']" @click="devSwitchUser(name)">{{ name }}
        </ControlButton>
      </div>
    </DevOnly>
    <p class="absolute right-2 top-2 text-xl font-bold text-gray-300">
      Angemeldet als {{ user?.name }}
    </p>
    <div class="absolute top-1/3 flex min-w-full flex-row justify-evenly align-middle text-gray-100">
      <div class="w-full p-4 md:w-1/2 lg:w-1/3">
        <p class="text-center text-4xl">Einem Spiel beitreten</p>
        <div v-if="openGames === undefined" class="mt-5 flex flex-col items-center justify-center gap-2">
          <UProgress class="h-8 w-32 text-center" color="cyan" />
        </div>
        <template v-else>
          <p v-if="openGames.length == 0" class="my-5 text-center text-2xl">
            Derzeit ist kein Spiel offen.
          </p>
          <ul v-else class="my-5">
            <li v-for="game of openGames" class="my-2">
              <div class="flex flex-row justify-center gap-4 align-middle">
                <NuxtLink :to="`/wizard/game/${game.id}`">
                  <button
                    class="mt-auto max-h-10 rounded-xl border border-blue-500 p-2 text-white transition duration-100 hover:cursor-pointer hover:bg-blue-500">
                    Spiel von {{ game.owner }}
                  </button>
                </NuxtLink>
              </div>
            </li>
          </ul>
        </template>
        <hr />
        <button @click="createGame()"
          class="my-4 block w-full rounded bg-blue-500 px-4 py-2 text-white transition-all duration-500 hover:bg-blue-700">
          Neues Spiel erstellen
        </button>
      </div>
    </div>
  </DefaultBackground>
</template>

<style scoped></style>
