<script lang="ts" setup>
import draggable from "vuedraggable";
import type { ParticipantDataWithId } from "~/utils/types";

const route = useRoute();
const game = useNobodyIsPerfectStore();
const gameId = "nobodyisperfect";
const { gdata, userdata, status } = storeToRefs(game);
const id = route.params.id;
await until(status).not.toBe("pending");

const allUsers: ParticipantDataWithId[] = Object.entries(getUsersOnServer()).map(([id, data]) => {
  return {id, ...data};
});

watch(() => gdata.value?.participantsList, () => {
  game.markUnsaved();
  game.usersUpdatedHandler();
}, {flush: "sync"});

function addQuestion() {
  gdata.value!.questions.push({
    question: { title: "Hier Frage einfügen" },
    answer: { title: "" },
  });
  game.markUnsaved();
}
</script>

<template>
  <div v-if="gdata" class="mt-4 flex w-full justify-around">
    <div class="flex flex-col gap-2">
      <draggable
        :list="gdata.questions"
        item-key="getKeyFromQData"
        class="mt-2 flex min-h-5 flex-col gap-2 text-center"
        ghost-class="ghost"
        @change="game.markUnsaved()"
      >
        <template #item="{ element, index }">
          <div class="flex">
            <img
              class="h-12 w-12"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/OOjs_UI_icon_draggable.svg/1024px-OOjs_UI_icon_draggable.svg.png"
              alt=""
            />
            <ControlButton>
              <NuxtLink :to="`/nobodyisperfect/config/${id}/${index + 1}`">
                {{
                  `Frage ${index + 1}: ${element.question.title.substring(0, 100)}`
                }}
              </NuxtLink>
            </ControlButton>
          </div>
        </template>
      </draggable>
      <ConfigSep />
      <ControlButton @click="addQuestion()"> + New</ControlButton>
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="flex items-center gap-2">
        <div class="my-4 text-center text-3xl font-bold text-gray-300">
          Participants:
        </div>
        <HelpModal name="Participants">
          Here you can see the participants of the quiz. To actually set the
          participants, go on discord and use the
          <br />
          <code>/setusers {{ gameId }}</code> command of Meister Quiz-Gon Jinn.
          This will <strong>overwrite</strong> the participants. After that,
          click on the reload button to see the new participants.
        </HelpModal>
      </div>
      <USelectMenu v-model="gdata.participantsList" :options="allUsers" placeholder="Select participants..." multiple value-attribute="id" class="w-64" >
        <template #option="{ option }">
          <UAvatar :src="option.avatarUrl"/>
          {{ option.displayName }}
        </template>  
      </USelectMenu>
      <ControlDiv class="px-2" v-for="user of gdata.participantsList">
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
