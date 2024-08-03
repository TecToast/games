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
      <div v-for="cat of Object.keys(jdata)" class="flex flex-col mt-8">
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
      <div v-if="users" v-for="user of Object.keys(users)" class="flex flex-col gap-4">
        <ControlButton class="bg-[#2b6499]" @click="jeopardy.currentUser = user">{{ users[user].displayName }}
        </ControlButton>
        <div class="flex">
          <ControlButton v-if="jAllData" v-for="joker of jAllData.jokers"
            @click="jeopardy.toggleJokerFromUser(user, joker)">{{ joker }}</ControlButton>
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
        <ControlButton @click="jeopardy.refreshData()">Reload data</ControlButton>
      </div>
      <ControlButton class="p-2">
        <NuxtLink target="_blank" :to="`/jeopardy/play/${id}/main`">Open main page to stream</NuxtLink>
      </ControlButton>
    </div>
  </DefaultBackground>
</template>