<script lang="ts" setup>
const route = useRoute();
const quiz = useMusicQuizStore();
const { gdata, users, status } = storeToRefs(quiz);
const id = route.params.id;
const gameId = "musicquiz";

await until(status).not.toBe("pending");

function reload() {
  if (quiz.unsavedChanges) {
    if (
      !confirm(
        "You have unsaved changes. Are you sure you want to reload? This will override your local changes.",
      )
    )
      return;
  }
  quiz.refreshData();
}
</script>

<template>
  <div v-if="gdata" class="flex w-full justify-around">
    <div class="flex w-full flex-col content-center">
      <h1 class="mt-4 text-center text-4xl text-white">
        Derzeit können die Tracks nur altmodisch verändert werden.
      </h1>
      <!--      <div v-for="track of gdata.tracks">{{ track }}</div>-->
    </div>
    <div class="flex w-full flex-col items-center gap-2">
      <div class="flex items-center gap-2">
        <div class="my-4 text-center text-3xl font-bold text-gray-300">
          Participants:
        </div>
        <ConfigReloadButton @click="reload" />
        <HelpModal name="Participants">
          Here you can see the participants of the quiz. To actually set the
          participants, go on discord and use the
          <br />
          <code>/setusers {{ gameId }}</code> command of Meister Quiz-Gon Jinn.
          This will <strong>overwrite</strong> the participants. After that,
          click on the reload button to see the new participants.
        </HelpModal>
      </div>
      <ControlDiv class="px-2" v-for="user of users?.list">
        {{ users?.data![user].displayName }}
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
