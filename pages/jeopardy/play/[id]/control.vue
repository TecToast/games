<script lang="ts" setup>
import { AnswerState } from '~/utils/jeopardy/types';

const jeopardy = useJeopardyStore();
const { jdata: jAllData, users } = storeToRefs(jeopardy);
const jdata = computed(() => jAllData.value?.categories);
const { id } = useRoute().params;
</script>

<template>
  <DefaultBackground v-if="jdata">
    <div class="flex justify-around">
      <div v-for="cat of Object.keys(jdata)" class="flex flex-col items-center mt-8">
        <TextBox class="text-2xl px-2 rounded-lg">{{ cat }}</TextBox>
        <div class="flex flex-col gap-4 mt-4">
          <div v-for="q of Object.keys(jdata[cat])" class="flex justify-center items-center">
            <ControlButton :class="{ 'bg-[#B0B0B0]': jdata[cat][Number.parseInt(q)].used }"
              @click="jeopardy.selectQuestion(cat, Number.parseInt(q))">{{ q }}</ControlButton>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-10 mt-12 ml-16">
      <TextBox class="text-2xl rounded-lg p-2">Questions</TextBox>
      <ControlButton @click="jeopardy.questionRevealed = true">Reveal Question</ControlButton>
      <ControlButton @click="jeopardy.answerState = AnswerState.Correct" class="border-green-700 border-2">Answer
        Correct</ControlButton>
      <ControlButton @click="jeopardy.answerState = AnswerState.Incorrect" class="border-red-700 border-2">Answer Wrong
      </ControlButton>
      <ControlButton @click="jeopardy.answerState = AnswerState.Unanswered">Hide Answer</ControlButton>
    </div>
    <div class="flex gap-10 mt-12 ml-16">
      <div v-if="users" v-for="user of users.list" class="flex flex-col gap-4">
        <ControlButton class="bg-[#2b6499]" :class="jeopardy.currentUser == user ? '!bg-gray-500' : ''"
          :disabled="jeopardy.currentUser == user" @click="jeopardy.currentUser = user">{{ users.data[user].displayName
          }}
        </ControlButton>
        <div class="flex">
          <ControlButton v-if="jAllData" v-for="joker of jAllData.jokers"
            @click="jeopardy.toggleJokerFromUser(user, joker)"
            :class="users.data[user].jokers.includes(joker) ? '' : '!bg-gray-500'">{{ joker }}</ControlButton>
        </div>
        <div class="flex justify-center">
          <ControlButton v-for="num of [100, 50]" @click="jeopardy.addPointsToUser(user, num)">{{ num }}</ControlButton>
        </div>
        <div class="flex justify-center">
          <ControlButton v-for="num of [-100, -50]" @click="jeopardy.addPointsToUser(user, num)">{{ num }}
          </ControlButton>
        </div>
      </div>
    </div>
    <div class="flex mt-12 ml-16 mr-4 justify-between">
      <div class="flex gap-10">
        <TextBox class="text-2xl rounded-lg p-2">Control</TextBox>
        <ControlButton @click="jeopardy.nextPlayerAndMainPage();">Next player + Main Page</ControlButton>
        <ControlButton @click="jeopardy.mainPage()">Main Page</ControlButton>
        <!-- <ControlButton @click="jeopardy.refreshData()">Reload data from server</ControlButton> -->
      </div>
      <div class="flex gap-2">
        <NuxtLink target="_blank" :to="`/jeopardy/play/${id}/main`">
          <ControlButton class="p-2 bg-cyan-600">
            Open main page to stream
          </ControlButton>
        </NuxtLink>
        <NuxtLink :to="`/jeopardy/config/${id}`">
          <ControlButton class="p-2 bg-red-900">
            Back to config
          </ControlButton>
        </NuxtLink>
      </div>
    </div>
    <HelpModal name="Control" class="ml-16 mt-4 !w-12 !h-12 !text-2xl">
      On the top you can select a question by clicking on the points. You can then reveal the question, mark the answer
      as correct or incorrect, or hide the answer again (to see the question if you are using images).
      <br>
      <br>
      Below you can select a user by clicking on their name. You can also toggle their jokers and add or remove points
      from them.
      <br>
      <br>
      At the bottom you can control the game flow. You can go to the next player and the main page, or directly to the
      main page.
      <br>
      <br>
      In the bottom right corner, you have two buttons: One to get back to the config and one to open the main page in a
      new tab, which can then be streamed on discord.
    </HelpModal>
  </DefaultBackground>
</template>