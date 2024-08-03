<script lang="ts" setup>
const route = useRoute();
const jeopardy = useJeopardyStore();
const { jdata } = storeToRefs(jeopardy);
const { id, category } = route.params;
const cat = computed(() => jdata.value?.categories[category.toString()])

const mapper = (thing: string) => {
  if (Number.isNaN(Number.parseInt(thing))) return null;
  jeopardy.markUnsaved();
  return {
    question: {
      title: 'Hier Frage einfügen'
    },
    answer: {
      title: 'Hier Antwort einfügen'
    },
    used: false
  }
}

function defaultPoints() {
  for (const key of ["100", "200", "300", "400", "500"]) {
    cat.value![key] = mapper(key.toString())!
  }
}
</script>

<template>
  <template v-if="jdata">
    <ConfigLinkGroup name="Punkte" :mapper :list="jdata.categories[route.params.category.toString()]"></ConfigLinkGroup>
    <ControlButton v-if="Object.keys(cat!).length == 0" @click="defaultPoints()" class="bg-yellow-600 mt-4">
      Standard-Punkteverteilung anwenden
    </ControlButton>
    <NuxtLink :to="`/jeopardy/config/${id}`" class="flex justify-center">
      <ControlButton class="mt-16">Zurück zu {{ id }}</ControlButton>
    </NuxtLink>
  </template>
  <TextBox v-else>Wie bist du hierher gekommen?</TextBox>
</template>