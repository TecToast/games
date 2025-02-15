<script lang="ts" setup>
const props = defineProps<{ gameId: string; gameName: string }>();
const { data, refresh } = await useFetch<string[]>(`/api/${props.gameId}/my`);
function createNewQuiz() {
  let quizName: string | null = "";
  while (quizName == "") {
    quizName = prompt(
      "Name of quiz? (must not contain spaces or special characters)",
    );
  }
  if (quizName == null) return;
  if (!quizName.match(idRegex)) {
    alert("The quiz name must not contain spaces or special characters.");
    return;
  }
  if (data.value?.includes(quizName)) {
    alert("You already have a quiz with this name.");
    return;
  }
  $fetch(`/api/${props.gameId}/create`, {
    method: "POST",
    body: { id: quizName },
  })
    .then(() => refresh())
    .catch((error) => {
      console.error(error);
      alert(
        "An error occured on creation of the quiz, please contact @tectoast.",
      );
    });
}
</script>

<template>
  <DefaultBackground class="items-center">
    <div class="mt-4 flex items-center justify-center gap-2">
      <TextBox class="px-4">{{ props.gameName }} Config</TextBox>
      <HelpModal name="Quiz Overview">
        Here you can create and manage your quizzes of type:
        {{ props.gameName }}. Click on a quiz to continue. Click on "+ Create a
        new quiz" to create a new quiz.
      </HelpModal>
    </div>
    <div class="mt-4 text-center text-3xl font-bold text-gray-300">
      Choose a quiz:
    </div>
    <div class="mt-10 flex w-[50vw] flex-col items-center gap-4">
      <NuxtLink v-for="quiz of data" :to="`/${props.gameId}/config/${quiz}`">
        <ControlButton> {{ quiz }}</ControlButton>
      </NuxtLink>
    </div>
    <div class="my-8 w-48 border-t-2 border-gray-500" />
    <ControlButton @click="createNewQuiz()">+ Create a new quiz </ControlButton>
  </DefaultBackground>
</template>
