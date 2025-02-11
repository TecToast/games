<script lang="ts" setup>
import { AnswerState } from "~/utils/jeopardy/types";

const jeopardy = useJeopardyStore();
const { jdata: jAllData, users } = storeToRefs(jeopardy);
const jdata = computed(() => jAllData.value?.categories);
const { id } = useRoute().params;
</script>

<template>
  <DefaultBackground v-if="jdata">
    <div class="flex justify-around">
      <div
        v-for="cat of Object.keys(jdata)"
        class="mt-8 flex flex-col items-center"
      >
        <TextBox class="rounded-lg px-2 text-2xl">{{ cat }}</TextBox>
        <div class="mt-4 flex flex-col gap-4">
          <div
            v-for="q of Object.keys(jdata[cat])"
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
        @click="jeopardy.answerState = AnswerState.Correct"
        class="border-2 border-green-700"
        >Answer Correct</ControlButton
      >
      <ControlButton
        @click="jeopardy.answerState = AnswerState.Incorrect"
        class="border-2 border-red-700"
        >Answer Wrong
      </ControlButton>
      <ControlButton @click="jeopardy.answerState = AnswerState.Unanswered"
        >Hide Answer</ControlButton
      >
    </div>
    <div class="ml-16 mt-12 flex gap-10">
      <div v-if="users" v-for="user of users.list" class="flex flex-col gap-4">
        <ControlButton
          class="bg-[#2b6499]"
          :class="jeopardy.currentUser == user ? '!bg-gray-500' : ''"
          :disabled="jeopardy.currentUser == user"
          @click="jeopardy.currentUser = user"
          >{{ users.data[user].displayName }}
        </ControlButton>
        <div class="flex">
          <ControlButton
            v-if="jAllData"
            v-for="joker of jAllData.jokers"
            @click="jeopardy.toggleJokerFromUser(user, joker)"
            :class="
              users.data[user].data.usedJokers.includes(joker)
                ? '!bg-gray-500'
                : ''
            "
            >{{ joker }}</ControlButton
          >
        </div>
        <div class="flex justify-center">
          <ControlButton
            v-for="num of [100, 50]"
            @click="jeopardy.addPointsToUser(user, num)"
            >{{ num }}</ControlButton
          >
        </div>
        <div class="flex justify-center">
          <ControlButton
            v-for="num of [-100, -50]"
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
