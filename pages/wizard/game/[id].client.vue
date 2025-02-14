<script setup lang="ts">
import {
  AllCards,
  convertCardToHref,
  type LayedCard,
  type Rule,
  Rules,
  type SelectChangeCard,
  SpecialRolesDescriptions,
  Color,
} from "~/utils/wizard/types";
import { watchWizard } from "~/utils/wsutils";
import { useStorage } from "@vueuse/core";
import { NOTHINGCARD } from "~/utils/wizard/specialcards";

const { user } = useUserSession();
const playerName = computed(() => user.value?.name ?? "");

const { data } = useWizardConnection();
const {
  isPredict,
  round,
  trump,
  firstCome,
  currentPlayer,
  playersInLobby,
  currentStitchWinner,
} = useGeneralData();
const isOwner = computed(() => playersInLobby.value[0] == playerName.value);
const { rules, notSet, switchRule } = useRules();
const layedCards = ref<LayedCard[]>([]);
const { startGame, noStart, leaveGame, stopGame, ranks, gamephase } =
  useGamePhase(playersInLobby, layedCards);
const trumpShift = useTrumpShift();
const { playerCards, removeCardFromDeck } = usePlayerCards(trump);
const { firstCard, resetFirstCard } = useFirstCard(layedCards);
const {
  stitchGoals,
  stitchDone,
  hasPredicted,
  results,
  stitchesPredicted,
  saveStitches,
  stitchReset,
} = useWizardNumbers(firstCome, playerName);
const playersTurn = computed(() => currentPlayer.value == playerName.value);
const { selectColorCard, layCardWithColor } = useColorSelect();
const isSelectColorModalActive = computed(() => selectColorCard.value != null);
const { isChangeStitchModalActive, changeStitchPrediction } =
  useChangeStitchPrediction();
const { isWinnerPollModalActive, voteForWinner } = useWinnerPoll();

const { playerRoles, requestSelectedRole, currentRoleSelectingPlayer } =
  useSpecialRoles();
const isRoleSelectionModalOpen = computed(
  () => currentRoleSelectingPlayer.value == playerName.value,
);
const isWaitingForOtherPlayersRoleSelectionModalOpen = computed(
  () =>
    currentRoleSelectingPlayer.value != "" &&
    currentRoleSelectingPlayer.value != playerName.value,
);
const volume = useStorage("volume", 10);
const oldVolume = ref(volume.value);

watchWizard(data, "RedirectHome", () => {
  navigateTo("/wizard");
});

watch(isPredict, (newVal) => {
  if (!newVal) {
    firstCome.value = "";
    hasPredicted.value = [];
  }
});

watchWizard(data, "PlayerCard", (d) => {
  const card = d.card.card;
  layedCards.value.find((x) => x.player == d.card.player)!.card = card;
  if (d.card.player == playerName.value) {
    removeCardFromDeck(card);
    selectColorCard.value = null;
  }
});
watchWizard(data, "AcceptedGoal", () => {
  firstCome.value = "";
  currentPlayer.value = "";
});
watch(round, () => {
  stitchReset();
});
useHead({
  link: AllCards.map((c) => ({
    rel: "preload",
    as: "image",
    href: convertCardToHref(c),
  })),
});

watchWizard(data, "ClearForNewSubRound", () => {
  layedCards.value = layedCards.value.map((x) => ({
    player: x.player,
    card: NOTHINGCARD,
  }));
  resetFirstCard();
  currentStitchWinner.value = "";
});
const isNewCardModal = ref(false);
const newCardImageSource = ref("");
watchWizard(data, "NewCardReceived", (d) => {
  isNewCardModal.value = true;
  selectChangeCardState.value = "nothing";
  newCardImageSource.value = convertCardToHref(d.card);
});

const selectChangeCardState = ref<SelectChangeCard>("nothing");
watchWizard(data, "SevenPointFiveUsed", () => {
  selectChangeCardState.value = "selectCard";
});
definePageMeta({ colorMode: "dark" });

const video = ref();
const player = ref(null);
const config = useRuntimeConfig();
if (config.public.wizardYT) {
  const { onLoaded } = useScriptYouTubePlayer({
    scriptOptions: { trigger: "onNuxtReady" },
  });

  // @ts-ignore
  onLoaded(async ({ YT }) => {
    // wait for the internal YouTube APIs to be ready
    const YouTube = await YT;
    await new Promise<void>((resolve) => {
      // @ts-ignore
      if (typeof YT.Player === "undefined") YouTube.ready(resolve);
      else resolve();
    });
    // load the API
    // @ts-ignore
    player.value = new YT.Player(video.value, {
      videoId: "dQw4w9WgXcQ",
      playerVars: {
        playsinline: 1,
        autoplay: 1,
        playlist: "dQw4w9WgXcQ",
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume.value);
        },
        onStateChange: (event: any) => {
          // @ts-ignore
          if (event.data === YT.PlayerState.ENDED) {
            event.target.playVideo(); // restart video if it reached the end
          }
        },
      },
    });
  });

  watch(
    volume,
    (v) => {
      if (v == 0) {
        // @ts-ignore
        player.value?.pauseVideo();
      } else {
        // @ts-ignore
        player.value?.playVideo();
      }
      // @ts-ignore
      player.value?.setVolume(v);
    },
    { immediate: true },
  );
}
const speakerImgSrc = computed(() => {
  const v = volume.value;
  if (v == 0) return "/speaker_level_0_icon.png";
  if (v < 50) return "/speaker_level_1_icon.png";
  return "/speaker_level_2_icon.png";
});

function muteSpeaker() {
  if (volume.value == 0) {
    const old = oldVolume.value;
    volume.value = old == 0 ? 10 : old;
  } else {
    oldVolume.value = volume.value;
    volume.value = 0;
  }
}
</script>

<template>
  <DefaultBackground>
    <div
      v-if="gamephase === 'lobby'"
      class="mt-20 flex flex-row justify-center"
    >
      <div class="hidden" ref="video" />
      <div class="w-1/3">
        <p class="mb-3 text-center text-3xl text-gray-300">Spieler</p>
        <ul class="divide-y-2 divide-gray-100 rounded-lg bg-white shadow">
          <li class="p-3" v-for="(c, index) of playersInLobby">
            {{ c + (index == 0 ? " (Owner)" : "") }}
          </li>
        </ul>
        <button
          @click="startGame()"
          v-if="isOwner"
          :class="noStart ? 'grayscale' : 'grayscale-0'"
          class="my-4 block w-full rounded bg-blue-500 px-4 py-2 text-white transition-all duration-500 hover:bg-blue-700"
        >
          Spiel starten
        </button>
        <button
          @click="leaveGame()"
          class="my-4 block w-full rounded bg-red-500 px-4 py-2 text-white transition-all duration-500 hover:bg-red-700"
        >
          Spiel verlassen
        </button>

        <div>
          <p class="mb-2 mt-10 text-center text-2xl text-gray-300">
            Spielregeln
          </p>
          <div class="flex flex-col gap-1">
            <div
              v-for="(x, index) of Object.keys(Rules)"
              class="flex flex-auto flex-col"
            >
              <hr v-if="index > 0" />
              <p class="mt-3 text-center text-xl text-gray-300">{{ x }}</p>
              <div class="flex flex-row gap-2">
                <button
                  v-for="r of Rules[x as Rule]"
                  @click="switchRule(x as Rule, r)"
                  :disabled="!isOwner"
                  :class="
                    rules[x] == r && !notSet ? 'grayscale-0' : 'grayscale'
                  "
                  class="my-4 block w-full rounded bg-green-500 px-4 py-2 text-white transition-all duration-500 hover:bg-green-700"
                >
                  {{ r }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="group fixed bottom-4 right-4" v-if="config.public.wizardYT">
        <!-- Lautsprecher-Icon -->
        <img
          :src="speakerImgSrc"
          id="speakerImgID"
          class="h-8 w-8 cursor-pointer"
          alt="Speaker Icon"
          @click="muteSpeaker"
        />

        <!-- Slider, der bei Hover sichtbar wird -->
        <div
          class="absolute bottom-12 right-0 w-32 rounded-lg bg-white p-2 opacity-0 shadow-lg transition-opacity duration-500 group-hover:opacity-100"
        >
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            v-model="volume"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div v-if="gamephase === 'game'">
      <div class="absolute right-2 top-2">
        <button
          @click="stopGame()"
          class="max-h-10 rounded-xl border border-red-500 p-2 text-white transition duration-100 hover:cursor-pointer hover:bg-red-500"
        >
          Spiel beenden
        </button>
      </div>
      <div class="text-center text-lg">
        <strong class="text-gray-100"
          >Runde {{ round }} - {{ playerName }}</strong
        >
      </div>
      <div
        class="absolute top-10 flex min-w-full flex-row justify-evenly align-middle text-gray-100"
      >
        <div>
          <strong class="text-center">Trumpf{{ trumpShift }}</strong>
          <div>
            <WizardCard :card="trump" type="trump"></WizardCard>
          </div>
        </div>
        <p
          v-if="selectChangeCardState == 'selectCard'"
          class="px-30 absolute z-10 py-60 text-3xl font-bold text-gray-200"
        >
          7 1/2: Wähle eine Karte aus, die du abgeben möchtest
        </p>
        <p
          v-if="selectChangeCardState == 'waitForOthers'"
          class="px-30 absolute z-10 py-60 text-3xl font-bold text-gray-200"
        >
          Warte auf andere Spieler
        </p>
        <div class="flex flex-row justify-evenly gap-5 align-middle">
          <div v-for="c of layedCards">
            <p
              class="text-center"
              :class="{ 'border-2 border-pink-500': currentPlayer == c.player }"
            >
              {{
                c.player +
                " (" +
                (stitchDone[c.player] ?? "0") +
                "/" +
                (stitchGoals[c.player] ?? "?") +
                ")" +
                (hasPredicted.includes(c.player) ? " ✅" : "")
              }}

              <span
                v-if="results[c.player] != undefined"
                :class="
                  results[c.player] >= 0 ? 'text-green-400' : 'text-red-500'
                "
              >
                {{ (results[c.player] >= 0 ? "+" : "") + results[c.player] }}
              </span>
              <br />
              <UTooltip
                v-if="playerRoles[c.player]"
                :text="
                  SpecialRolesDescriptions[playerRoles[c.player]] ??
                  'Versteckte Rolle'
                "
                :popper="{ placement: 'right' }"
                :ui="{ width: 'max-w-screen-xl' }"
                class="w-full"
              >
                <span class="w-full justify-center text-gray-400">
                  {{ playerRoles[c.player] }}
                </span>
              </UTooltip>
            </p>
            <WizardCard
              class="mt-2"
              :card="c.card"
              :type="'layed'"
              :firstCard="firstCard"
            ></WizardCard>
          </div>
        </div>
      </div>
      <UModal v-model="isSelectColorModalActive" prevent-close>
        <!-- TODO zweite UCard einbauen um andere Spieler zu benachrichtigen, wenn jemand etwas auswählen muss -->
        <UCard>
          <template #header>
            <div class="text-center text-2xl font-bold text-gray-300">
              Wähle eine Farbe aus
            </div>
          </template>
          <div class="flex gap-3">
            <button
              @click="layCardWithColor(Color.Red)"
              class="w-1/4 rounded bg-red-700 px-4 py-2"
            >
              Rot
            </button>
            <button
              @click="layCardWithColor(Color.Yellow)"
              class="w-1/4 rounded bg-yellow-500 px-4 py-2"
            >
              Gelb
            </button>
            <button
              @click="layCardWithColor(Color.Green)"
              class="w-1/4 rounded bg-green-800 px-4 py-2"
            >
              Grün
            </button>
            <button
              @click="layCardWithColor(Color.Blue)"
              class="w-1/4 rounded bg-blue-700 px-4 py-2"
            >
              Blau
            </button>
          </div>
        </UCard>
      </UModal>
      <UModal v-model="isChangeStitchModalActive" prevent-close>
        <UCard>
          <template #header>
            <div class="text-center text-2xl font-bold text-gray-300">
              Ändere deine Vorhersage
            </div>
          </template>
          <div class="flex justify-center gap-3">
            <button
              v-if="stitchGoals[playerName] != 0"
              @click="changeStitchPrediction(-1)"
              class="w-1/4 rounded bg-gray-800 px-4 py-2 font-bold text-gray-100"
            >
              - 1
            </button>
            <button
              v-if="stitchGoals[playerName] != round"
              @click="changeStitchPrediction(1)"
              class="w-1/4 rounded bg-gray-400 px-4 py-2 font-bold"
            >
              + 1
            </button>
          </div>
        </UCard>
      </UModal>
      <UModal v-model="isNewCardModal" :ui="{ width: 'w-64' }">
        <UCard>
          <template #header>
            <div class="text-center text-2xl font-bold text-gray-300">
              Neue Karte:
            </div>
          </template>
          <div class="flex justify-center">
            <img alt="newCard" :src="newCardImageSource" class="w-48 rounded" />
          </div>
        </UCard>
      </UModal>
      <UModal v-model="isWinnerPollModalActive" prevent-close>
        <UCard>
          <template #header>
            <div class="text-center text-2xl font-bold text-gray-300">
              Wer soll den Stich bekommen?
            </div>
          </template>
          <div class="flex justify-center gap-1">
            <div
              v-for="player of playersInLobby.filter((p) => p != playerName)"
              class="px-2 py-0"
            >
              <button
                @click="voteForWinner(player)"
                class="rounded bg-gray-800 px-4 py-2 font-bold text-gray-100"
              >
                {{ player }}
              </button>
            </div>
          </div>
        </UCard>
      </UModal>
      <div
        v-if="firstCome !== ''"
        class="absolute flex min-w-full flex-row justify-center text-center align-middle text-2xl font-bold text-gray-100"
        style="top: 28%"
      >
        <div>Tipp: {{ firstCome }} kommt raus!</div>
      </div>

      <form @submit.prevent="saveStitches()" v-if="firstCome != ''">
        <div
          class="absolute flex min-w-full flex-row justify-center gap-4 align-middle"
          style="top: 35%"
        >
          <div class="flex flex-col">
            <label for="stitches" class="text-gray-300">Stiche</label>
            <input
              v-model="stitchesPredicted"
              name="stitches"
              class="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="stitches"
              type="number"
              placeholder="0"
              min="0"
              :max="round + 3"
            />
          </div>
          <button
            type="submit"
            :disabled="!playersTurn"
            class="mt-auto max-h-10 rounded-xl border p-2 text-white transition duration-100"
            :class="
              playersTurn
                ? 'border-blue-500 hover:cursor-pointer hover:bg-blue-500'
                : 'border-gray-500'
            "
          >
            Bestätigen
          </button>
        </div>
      </form>
      <div
        v-if="currentStitchWinner != ''"
        class="absolute flex min-w-full flex-row justify-center text-center align-middle"
        style="top: 35%"
      >
        <p class="text-center text-3xl font-bold text-gray-200">
          Der Stich geht an
          <span :class="{ 'text-[#12abf5]': currentStitchWinner == null }">
            {{
              currentStitchWinner ??
              "Niemand! Es hat keiner gewonnen. Auch nicht Christian."
            }} </span
          >!
        </p>
      </div>
      <div
        class="absolute flex min-w-full flex-row flex-wrap justify-center gap-4 align-middle"
        style="top: 45%"
      >
        <WizardCard
          class="z-20"
          v-model:selectChangeCardState="selectChangeCardState"
          v-for="c of playerCards"
          type="hand"
          :card="c"
          :firstCard
          :playerCards
          :playersTurn
          :isPredict
          :firstCome
          @removeCard="removeCardFromDeck"
        ></WizardCard>
      </div>
    </div>
    <div v-if="gamephase == 'finished'">
      <div
        class="absolute top-1/3 flex min-w-full flex-row justify-evenly align-middle text-gray-100"
      >
        <div class="w-full p-4 md:w-1/2 lg:w-1/3">
          <p class="text-center text-4xl">Rangliste</p>
          <ul class="my-5">
            <li v-for="(pl, i) of ranks" class="my-2">
              <div class="flex flex-row justify-center gap-4 align-middle">
                <p class="text-lg text-gray-200">
                  Platz {{ i + 1 }}: {{ pl.player }} ({{ pl.points }} Punkte)
                </p>
              </div>
            </li>
          </ul>
          <button
            @click="leaveGame()"
            class="my-4 block w-full rounded bg-red-500 px-4 py-2 text-white transition-all duration-500 hover:bg-red-700"
          >
            Spiel löschen
          </button>
        </div>
      </div>
    </div>
  </DefaultBackground>

  <UModal v-model="isRoleSelectionModalOpen" prevent-close>
    <UCard class="px-2 py-0">
      <template #header>
        <div class="text-center text-2xl font-bold text-gray-300">
          Wähle eine Rolle aus
        </div>
      </template>
      <div
        v-for="role of Object.keys(SpecialRolesDescriptions)"
        class="px-2 py-0"
      >
        <UTooltip
          :text="SpecialRolesDescriptions[role]"
          :popper="{ placement: 'right' }"
          :ui="{ width: 'max-w-screen-xl' }"
          class="w-full"
        >
          <button
            @click="requestSelectedRole(role)"
            :class="
              !Object.values(playerRoles).includes(role)
                ? 'grayscale-0'
                : 'grayscale'
            "
            class="my-2 w-full rounded bg-green-500 px-4 py-2 text-white transition-all duration-500 hover:bg-green-700"
          >
            {{ role }}
          </button>
        </UTooltip>
      </div>
    </UCard>
  </UModal>
  <UModal
    v-model="isWaitingForOtherPlayersRoleSelectionModalOpen"
    prevent-close
  >
    <UCard class="px-2 py-0">
      <template #header>
        <div class="text-center text-2xl font-bold text-gray-300">
          {{ currentRoleSelectingPlayer + " wählt gerade eine Rolle aus" }}
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style scoped></style>
