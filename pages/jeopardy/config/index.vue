<script lang="ts" setup>
const { data, refresh } = await useFetch<string[]>('/api/jeopardy/my')

function createNewQuiz() {
  let quizName: string | null = "";
  while (quizName == "") {
    quizName = prompt("Wie soll das Quiz heißen?");
  }
  if (quizName == null) return;
  if (data.value?.includes(quizName)) {
    alert("Ein Quiz mit diesem Namen existiert bereits.");
    return;
  }
  $fetch('/api/jeopardy/create', {
    method: 'POST',
    body: quizName
  }).then(() => refresh()).catch((error) => {
    console.error(error);
    alert("Es ist ein Fehler beim Erstellen des Quizzes aufgetreten, melde dich bitte bei Flo | TecToast.");
  });
}
</script>

<template>
  <DefaultBackground class="items-center">
    <div class="flex justify-center mt-4">
      <TextBox class="px-4">Jeopardy Config</TextBox>
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