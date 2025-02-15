<script lang="ts" setup>
const route = useRoute();
const game = useJeopardyStore();
const gameId = "jeopardy";
const { jdata, userdata, status } = storeToRefs(game);
const id = route.params.id;
await until(status).not.toBe("pending");

function reload() {
  if (game.unsavedChanges) {
    if (
      !confirm(
        "You have unsaved changes. Are you sure you want to reload? This will override your local changes.",
      )
    )
      return;
  }
  game.refreshData();
}
</script>

<template>
  <div v-if="jdata" class="flex w-full justify-around">
    <div class="flex flex-col">
      <ConfigLeafGroup name="Joker" :list="jdata.jokers">
        <HelpModal name="Joker">
          Here you can set the jokers which will be available to the players.
          You can add new jokers by clicking on the "+ New" button. You can
          remove jokers by clicking on the trash can icon. Please note that the
          names of the jokers should be at most 2 characters long so they can
          fit into the UI.
        </HelpModal>
      </ConfigLeafGroup>
      <ConfigSep />
      <ConfigLinkGroup name="Categories" :list="jdata.categories" :store="game">
        <HelpModal name="Categories">
          Here you can set the categories for the quiz. You can add new
          categories by clicking on the "+ New" button. To edit the questions in
          a category, click on the category name. You can remove categories by
          clicking on the trash can icon.
        </HelpModal>
      </ConfigLinkGroup>
    </div>
    <div class="flex w-full flex-col items-center gap-2">
      <div class="flex items-center gap-2">
        <div class="my-4 text-center text-3xl font-bold text-gray-300">
          Participants:
        </div>
        <ConfigReloadButton @click="reload()" />
        <HelpModal name="Participants">
          Here you can see the participants of the quiz. To actually set the
          participants, go on discord and use the
          <br />
          <code>/setusers {{ gameId }}</code> command of Meister Quiz-Gon Jinn.
          This will <strong>overwrite</strong> the participants. After that,
          click on the reload button to see the new participants.
        </HelpModal>
      </div>
      <ControlDiv v-for="user of jdata.participantsList" class="px-2">
        {{ getDisplayName(user) }}
      </ControlDiv>
    </div>
  </div>
  <TextBox v-else class="mt-16 p-4">No quiz found for ID {{ id }}.</TextBox>

  <div class="fixed bottom-4 flex items-center gap-4">
    <NuxtLink :to="`/${gameId}/play/${id}/control`">
      <ControlButton class="bg-green-600">Switch to game view</ControlButton>
    </NuxtLink>
    <NuxtLink class="" :to="`/${gameId}/config`">
      <ControlButton>Back to overview</ControlButton>
    </NuxtLink>
    <HelpModal name="Finish">
      With "Back to overview" you can go back to the overview of your quizzes.
      <br /><br />
      When you configured everything, you can switch to the game view by
      clicking on "Switch to game view".
    </HelpModal>
  </div>
</template>
