<script lang="ts" setup>
const game = useNobodyIsPerfectStore();
const { gdata, userdata, state, currentQuestionIndex, timer } =
  storeToRefs(game);
const qData = computed(
  () => gdata.value?.questions[currentQuestionIndex.value],
);

function nameToImageSrc(num: number): string {
  const user = game.revealedAnswers[num - 1].user;
  if (user === "RICHTIG")
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Eo_circle_green_checkmark.svg/1200px-Eo_circle_green_checkmark.svg.png";
  return getAvatarUrl(user);
}
</script>

<template>
  <div
    v-if="gdata"
    style="background-image: linear-gradient(#8902c7, #4402c7)"
    class="min-h-screen"
  >
    <div
      v-if="state == 'overview'"
      class="flex min-h-screen flex-col items-center justify-around"
    >
      <TextBox
        class="flex h-52 min-w-[50vw] max-w-[50vw] items-center justify-center overflow-auto text-wrap border border-gray-800"
      >
        {{
          currentQuestionIndex == 0
            ? "Testfrage"
            : `Frage ${currentQuestionIndex}`
        }}
      </TextBox>
      <div
        v-if="gdata?.participantsList"
        class="mt-10 flex min-w-full items-center justify-around"
      >
        <div
          v-for="user of gdata.participantsList"
          :key="user"
          class="flex h-full flex-col items-center justify-end gap-8"
        >
          <img
            class="w-52 rounded-full"
            :src="getAvatarUrl(user)"
            :alt="user"
          />
          <TextBox class="px-2">{{ userdata[user].points }}</TextBox>
        </div>
      </div>
    </div>

    <div
      v-if="state == 'question' && qData"
      class="flex min-h-screen flex-col items-center justify-around"
    >
      <TextBox
        class="flex h-52 !w-[50vw] items-center justify-center overflow-scroll"
      >
        {{ qData.question.title }}
      </TextBox>
      <template v-if="qData.question.file">
        <img
          v-if="qData.question.file && !qData.question.file.endsWith('mp4')"
          class="h-[50vh]"
          :src="`/api/media/${qData.question.file}`"
          :alt="qData.question.file"
        />
        <video
          v-if="qData.question.file && qData.question.file.endsWith('mp4')"
          controls
          class="h-[50vh]"
        >
          <source :src="`/api/media/${qData.question.file}`" type="video/mp4" />
        </video>
        <div
          class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-500 text-5xl"
        >
          {{ timer }}
        </div>
      </template>
      <div
        v-else
        class="flex h-64 w-64 items-center justify-center rounded-full bg-gray-500 text-9xl"
      >
        {{ timer }}
      </div>
    </div>
    <div
      v-if="state == 'answer' && qData"
      class="flex min-h-screen flex-col items-center justify-around"
    >
      <TextBox
        class="flex h-52 min-w-[50vw] max-w-[50vw] items-center justify-center"
      >
        {{ qData.question.title }}
      </TextBox>

      <template
        v-if="qData.question.file && game.answerMediaState == 'question'"
      >
        <img
          v-if="qData.question.file && !qData.question.file.endsWith('mp4')"
          class="h-[50vh]"
          :src="`/api/media/${qData.question.file}`"
          :alt="qData.question.file"
        />
        <video
          v-if="qData.question.file && qData.question.file.endsWith('mp4')"
          controls
          class="h-[50vh]"
        >
          <source :src="`/api/media/${qData.question.file}`" type="video/mp4" />
        </video>
      </template>
      <template
        v-else-if="qData.answer.file && game.answerMediaState == 'answer'"
      >
        <img
          v-if="qData.answer.file && !qData.answer.file.endsWith('mp4')"
          class="h-[50vh]"
          :src="`/api/media/${qData.answer.file}`"
          :alt="qData.answer.file"
        />
        <video
          v-if="qData.answer.file && qData.answer.file.endsWith('mp4')"
          controls
          class="h-[50vh]"
        >
          <source :src="`/api/media/${qData.answer.file}`" type="video/mp4" />
        </video>
      </template>
      <div v-else class="flex flex-col gap-8">
        <div
          v-for="num in game.totalAnswerCount"
          :key="num"
          class="flex items-center gap-4"
        >
          <img
            v-if="!!game.revealedAnswers[num - 1]?.showUser"
            class="h-16 w-16 rounded-full"
            :src="nameToImageSrc(num)"
            :alt="num.toString()"
          />
          <div
            v-else
            class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-500 text-4xl"
          >
            ?
          </div>
          <TextBox
            class="flex h-24 min-w-[75vw] max-w-[75vw] items-center justify-start px-2"
          >
            <div class="flex w-full items-center justify-between">
              <div>
                {{ String.fromCharCode(num + 96) }})
                {{ game.revealedAnswers[num - 1]?.answer ?? "" }}
              </div>
              <div class="flex gap-2">
                <img
                  v-for="url of game.revealedAnswers[num - 1]?.guessedThis ??
                  []"
                  :key="url"
                  class="h-12 w-12 rounded-full"
                  :src="url"
                  alt="..."
                />
              </div>
            </div>
          </TextBox>
        </div>
      </div>
    </div>
  </div>
  <TextBox v-else class="mt-16 p-4">No quiz found.</TextBox>
</template>
