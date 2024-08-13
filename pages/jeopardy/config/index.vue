<script lang="ts" setup>
const { data, refresh } = await useFetch<string[]>('/api/jeopardy/my')

function createNewQuiz() {
  let quizName: string | null = "";
  while (quizName == "") {
    quizName = prompt("Name of quiz? (must not contain spaces or special characters)");
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
  $fetch('/api/jeopardy/create', {
    method: 'POST',
    body: quizName
  }).then(() => refresh()).catch((error) => {
    console.error(error);
    alert("An error occured on creation of the quiz, please contact @tectoast.");
  });
}
</script>

<template>
  <DefaultBackground class="items-center">
    <div class="flex justify-center mt-4 items-center gap-2">
      <TextBox class="px-4">Jeopardy Config</TextBox>
      <HelpModal name="Jeopardy Overview">
        Here you can create and manage your Jeopardy quizzes. Click on a quiz to continue.
        Click on "+ Create a new quiz" to create a new quiz.
      </HelpModal>
    </div>
    <div class="text-gray-300 font-bold text-3xl text-center mt-4">Choose a quiz:</div>
    <div class="flex flex-col items-center w-[50vw] gap-4 mt-10">
      <NuxtLink v-for="quiz of data" :to="`/jeopardy/config/${quiz}`">
        <ControlButton> {{ quiz }}</ControlButton>
      </NuxtLink>
    </div>
    <div class="border-t-2 border-gray-500 w-48 my-8"></div>
    <ControlButton @click="createNewQuiz()">+ Create a new quiz</ControlButton>
  </DefaultBackground>
</template>