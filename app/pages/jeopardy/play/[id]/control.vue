<script lang="ts" setup>
import { AnswerState } from "~/utils/jeopardy/types";

const jeopardy = useJeopardyStore();
const { jdata: jAllData, userdata } = storeToRefs(jeopardy);
const jdata = computed(() => jAllData.value?.categories);
const { id } = useRoute().params;
</script>

<template>
  <DefaultBackground v-if="jdata">
    <div class="flex justify-around">
      <div
        v-for="cat of Object.keys(jdata)"
        :key="cat"
        class="mt-8 flex flex-col items-center"
      >
        <TextBox class="rounded-lg px-2 text-2xl">{{ cat }}</TextBox>
        <div class="mt-4 flex flex-col gap-4">
          <div
            v-for="q of Object.keys(jdata[cat])"
            :key="q"
            class="flex items-center justify-center"
          >
            <ControlButton
              :class="{ 'bg-[#B0B0B0]': jdata[cat][Number.parseInt(q)].used }"
              @click="jeopardy.selectQuestion(cat, Number.parseInt(q))"
              >{{ q }}</ControlButton
            >
          </div>
        </div>
      </div>
    </div>
    <div class="ml-16 mt-12 flex gap-10">
      <TextBox class="rounded-lg p-2 text-2xl">Questions</TextBox>
      <ControlButton @click="jeopardy.questionRevealed = true"
        >Reveal Question</ControlButton
      >
      <ControlButton
        class="border-2 border-green-700"
        @click="jeopardy.answerState = AnswerState.Correct"
        >Answer Correct</ControlButton
      >
      <ControlButton
        class="border-2 border-red-700"
        @click="jeopardy.answerState = AnswerState.Incorrect"
        >Answer Wrong
      </ControlButton>
      <ControlButton @click="jeopardy.answerState = AnswerState.Unanswered"
        >Hide Answer</ControlButton
      >
    </div>
    <div v-if="jAllData" class="ml-16 mt-12 flex gap-10">
      <div
        v-for="user of jAllData?.participantsList"
        :key="user"
        class="flex flex-col gap-4"
      >
        <ControlButton
          class="bg-[#2b6499]"
          :class="jeopardy.currentUser == user ? '!bg-gray-500' : ''"
          :disabled="jeopardy.currentUser == user"
          @click="jeopardy.currentUser = user"
          >{{ getDisplayName(user) }}
        </ControlButton>
        <div v-if="jAllData" class="flex">
          <ControlButton
            v-for="joker of jAllData.jokers"
            :key="joker"
            :class="
              userdata[user].usedJokers.includes(joker) ? '!bg-gray-500' : ''
            "
            @click="jeopardy.toggleJokerFromUser(user, joker)"
            >{{ joker }}</ControlButton
          >
        </div>
        <div class="flex justify-center">
          <ControlButton
            v-for="num of [100, 50]"
            :key="num"
            @click="jeopardy.addPointsToUser(user, num)"
            >{{ num }}</ControlButton
          >
        </div>
        <div class="flex justify-center">
          <ControlButton
            v-for="num of [-100, -50]"
            :key="num"
            @click="jeopardy.addPointsToUser(user, num)"
            >{{ num }}
          </ControlButton>
        </div>
      </div>
    </div>
    <div class="ml-16 mr-4 mt-12 flex justify-between">
      <div class="flex gap-10">
        <TextBox class="rounded-lg p-2 text-2xl">Control</TextBox>
        <ControlButton @click="jeopardy.nextPlayerAndMainPage()"
          >Next player + Main Page</ControlButton
        >
        <ControlButton @click="jeopardy.mainPage()">Main Page</ControlButton>
        <!-- <ControlButton @click="jeopardy.refreshData()">Reload data from server</ControlButton> -->
      </div>
      <div class="flex gap-2">
        <NuxtLink target="_blank" :to="`/jeopardy/play/${id}/main`">
          <ControlButton class="bg-cyan-600 p-2">
            Open main page to stream
          </ControlButton>
        </NuxtLink>
        <NuxtLink :to="`/jeopardy/config/${id}`">
          <ControlButton class="bg-red-900 p-2"> Back to config </ControlButton>
        </NuxtLink>
      </div>
    </div>
    <HelpModal name="Control" class="ml-16 mt-4 !h-12 !w-12 !text-2xl">
      On the top you can select a question by clicking on the points. You can
      then reveal the question, mark the answer as correct or incorrect, or hide
      the answer again (to see the question if you are using images).
      <br />
      <br />
      Below you can select a user by clicking on their name. You can also toggle
      their jokers and add or remove points from them.
      <br />
      <br />
      At the bottom you can control the game flow. You can go to the next player
      and the main page, or directly to the main page.
      <br />
      <br />
      In the bottom right corner, you have two buttons: One to get back to the
      config and one to open the main page in a new tab, which can then be
      streamed on discord.
    </HelpModal>
  </DefaultBackground>
</template>
