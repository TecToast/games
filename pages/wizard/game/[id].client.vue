<script setup lang="ts">
import {
  AllCards,
  convertCardToHref,
  type LayedCard,
  NOTHINGCARD,
  Rules,
} from "~/utils/wizard/types";
import { useTrumpShift } from "~/composables/wizard/trumpshifts";
import { useFirstCard } from "~/composables/wizard/firstcard";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { watchMessage } from "~/utils/wsutils";
import { useWizardNumbers } from "~/composables/wizard/wizardNumbers";
import { usePlayerCards } from "~/composables/wizard/playercards";
import { useRules } from "~/composables/wizard/rules";
import { useGamePhase } from "~/composables/wizard/gamephase";
import { useGeneralData } from "~/composables/wizard/generaldata";
import { useColorSelect } from "~/composables/wizard/colorSelect";
import { useChangeStitchPrediction } from "~/composables/wizard/changeStitchPrediction";

const auth = useAuthStore();
const playerName = computed(() => auth.data?.name ?? "");

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

watchMessage(data, "RedirectHome", () => {
  navigateTo("/wizard");
});

watch(isPredict, (newVal) => {
  if (!newVal) {
    firstCome.value = "";
    hasPredicted.value = [];
  }
});

watchMessage(data, "PlayerCard", (d) => {
  const card = d.card.card;
  layedCards.value.find((x) => x.player == d.card.player)!.card = card;
  if (d.card.player == playerName.value) {
    removeCardFromDeck(card);
    selectColorCard.value = null;
  }
});
watchMessage(data, "AcceptedGoal", () => {
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

watchMessage(data, "ClearForNewSubRound", () => {
  layedCards.value = layedCards.value.map((x) => ({
    player: x.player,
    card: NOTHINGCARD,
  }));
  resetFirstCard();
  currentStitchWinner.value = "";
});
</script>

<template>
  <DefaultBackground>
    <div
      v-if="gamephase === 'lobby'"
      class="mt-20 flex flex-row justify-center"
    >
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
                  v-for="r of Rules[x]"
                  @click="switchRule(x, r)"
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
          >Runde {{ round }} - {{ auth.data.name }}</strong
        >
      </div>
      <div
        class="absolute top-10 flex min-w-full flex-row justify-evenly align-middle text-gray-100"
      >
        <div>
          <strong class="text-center">Trumpf{{ trumpShift }}</strong>
          <WizardCard :card="trump" type="trump"></WizardCard>
        </div>
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
                v-if="results[c.player]"
                :class="
                  results[c.player] > 0 ? 'text-green-400' : 'text-red-500'
                "
              >
                {{
                  (results[c.player] > 0 ? "+" : "") + results[c.player]
                }}</span
              >
            </p>
            <WizardCard
              :card="c.card"
              :type="'layed'"
              :firstCard="firstCard"
            ></WizardCard>
            {{ firstCard }}
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
              @click="layCardWithColor('Rot')"
              class="w-1/4 rounded bg-red-700 px-4 py-2"
            >
              Rot
            </button>
            <button
              @click="layCardWithColor('Gelb')"
              class="w-1/4 rounded bg-yellow-500 px-4 py-2"
            >
              Gelb
            </button>
            <button
              @click="layCardWithColor('Grün')"
              class="w-1/4 rounded bg-green-800 px-4 py-2"
            >
              Grün
            </button>
            <button
              @click="layCardWithColor('Blau')"
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
              :max="round"
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
              "Wirklich Niemanden! Es hat keiner gewonnen. Auch nicht Christian."
            }} </span
          >!
        </p>
      </div>
      <div
        class="absolute flex min-w-full flex-row flex-wrap justify-center gap-4 align-middle"
        style="top: 45%"
      >
        <WizardCard
          v-for="c of playerCards"
          type="hand"
          :card="c"
          :firstCard
          :playerCards
          :playersTurn
          :isPredict
          :firstCome
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
</template>

<style scoped></style>
