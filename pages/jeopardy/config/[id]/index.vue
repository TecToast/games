<script lang="ts" setup>
const route = useRoute();
const jeopardy = useJeopardyStore();
const { jdata, users } = storeToRefs(jeopardy);
const id = route.params.id;
</script>

<template>

  <div v-if="jdata" class="flex w-full justify-around">
    <div class="flex flex-col">
      <ConfigLeafGroup name="Joker" :list="jdata.jokers"></ConfigLeafGroup>
      <ConfigSep />
      <ConfigLinkGroup name="Categories" :list="jdata.categories"></ConfigLinkGroup>
    </div>
    <div class="flex flex-col items-center w-full gap-2">
      <div class="text-gray-300 font-bold text-3xl text-center my-4">Teilnehmer:</div>
      <ControlDiv class="px-2" v-for="user of Object.keys(users!)">
        {{ users![user].displayName }}
      </ControlDiv>
    </div>
  </div>
  <TextBox v-else class="mt-16 p-4">No quiz found for ID {{ id }}.</TextBox>

  <div class="fixed bottom-4 flex gap-4">
    <NuxtLink :to="`/jeopardy/play/${id}/control`">
      <ControlButton class="bg-green-600">Switch to game view</ControlButton>
    </NuxtLink>
    <NuxtLink class="" to="/jeopardy/config">
      <ControlButton>Back to overview</ControlButton>
    </NuxtLink>
  </div>

</template>