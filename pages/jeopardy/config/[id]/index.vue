<script lang="ts" setup>
const route = useRoute();
const jeopardy = useJeopardyStore();
const { jdata, users } = storeToRefs(jeopardy);
const id = route.params.id;

function reload() {
  if (jeopardy.unsavedChanges) {
    if (!confirm("You have unsaved changes. Are you sure you want to reload? This will override your local changes.")) return;
  }
  jeopardy.refreshData()
}
</script>

<template>

  <div v-if="jdata" class="flex w-full justify-around">
    <div class="flex flex-col">
      <ConfigLeafGroup name="Joker" :list="jdata.jokers">
        <HelpModal name="Joker">
          Here you can set the jokers which will be available to the players. You can add new jokers by clicking on the
          "+ New" button. You can remove jokers by clicking on the trash can icon.
          Please note that the names of the jokers should be at most 2 characters long so they can fit into the UI.
        </HelpModal>
      </ConfigLeafGroup>
      <ConfigSep />
      <ConfigLinkGroup name="Categories" :list="jdata.categories">
        <HelpModal name="Categories">
          Here you can set the categories for the quiz. You can add new categories by clicking on the "+ New" button.
          To edit the questions in a category, click on the category name. You can remove categories by clicking on the
          trash can icon.
        </HelpModal>

      </ConfigLinkGroup>
    </div>
    <div class="flex flex-col items-center w-full gap-2">
      <div class="flex items-center gap-2">
        <div class="text-gray-300 font-bold text-3xl text-center my-4">Participants:</div>
        <ConfigReloadButton @click="reload()" />
        <HelpModal name="Participants">
          Here you can see the participants of the quiz. To actually set the participants, go on discord and use the
          <br>
          <code>/jeopardy setusers</code> command of Meister Quiz-Gon Jinn. This will <strong>overwrite</strong> the
          participants.
          After that, click on the reload button to see the new participants.
        </HelpModal>
      </div>
      <ControlDiv class="px-2" v-for="user of users?.list">
        {{ users?.data![user].displayName }}
      </ControlDiv>
    </div>
  </div>
  <TextBox v-else class="mt-16 p-4">No quiz found for ID {{ id }}.</TextBox>

  <div class="fixed bottom-4 flex gap-4 items-center">
    <NuxtLink :to="`/jeopardy/play/${id}/control`">
      <ControlButton class="bg-green-600">Switch to game view</ControlButton>
    </NuxtLink>
    <NuxtLink class="" to="/jeopardy/config">
      <ControlButton>Back to overview</ControlButton>
    </NuxtLink>
    <HelpModal name="Finish">
      With "Back to overview" you can go back to the overview of your Jeopardy quizzes. <br><br>
      When you configured everything, you can switch to the game view by clicking on "Switch to game view".
    </HelpModal>
  </div>

</template>