<script lang="ts" setup>
const jeopardy = useJeopardyStore();
const { jdata: jAllData, userdata } = storeToRefs(jeopardy);
const jdata = computed(() => jAllData.value?.categories);
</script>

<template>
  <div
    v-if="jdata"
    style="background-image: linear-gradient(#8902c7, #4402c7)"
    class="min-h-screen"
  >
    <div class="flex flex-col items-center justify-start">
      <div
        class="flex min-w-full items-start justify-evenly"
        style="min-height: 50vh"
      >
        <div
          v-for="cat of Object.keys(jdata)"
          :key="cat"
          class="mt-5 flex flex-col items-center"
        >
          <TextBox class="px-8">{{ cat }}</TextBox>
          <div class="mt-5 h-full w-full items-center justify-start">
            <div
              v-for="q of Object.keys(jdata[cat])"
              :key="q"
              class="mt-4 flex items-center justify-center"
            >
              <TextBox
                class="px-12"
                :class="
                  jdata[cat][Number.parseInt(q)].used ? '!bg-[#505050]' : ''
                "
              >
                {{ q }}</TextBox
              >
            </div>
          </div>
        </div>
      </div>
      <div class="mt-10 flex min-w-full items-center justify-around">
        <div
          v-for="user of jAllData?.participantsList"
          :key="user"
          class="flex h-full flex-col items-center justify-end gap-8"
        >
          <div v-if="jAllData" class="flex w-48 justify-evenly">
            <template v-for="joker of jAllData.jokers" :key="joker">
              <div
                v-if="userdata[user].usedJokers != undefined"
                class="flex h-12 w-12 items-center justify-center rounded-full text-3xl text-white"
                :class="{
                  'bg-[#888888]': userdata[user].usedJokers.includes(joker),
                  'bg-[#007800]': !userdata[user].usedJokers.includes(joker),
                }"
              >
                {{ joker }}
              </div>
            </template>
          </div>
          <img
            class="w-52 rounded-full"
            :class="{
              'border-4 border-yellow-400': user == jeopardy.currentUser,
            }"
            :src="getAvatarUrl(user)"
            :alt="user"
          />
          <TextBox class="px-2">{{ userdata[user].points }}</TextBox>
        </div>
      </div>
    </div>
  </div>
</template>
