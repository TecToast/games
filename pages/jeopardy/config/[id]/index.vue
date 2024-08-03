<script lang="ts" setup>
const route = useRoute();
const jeopardy = useJeopardyStore();
const { jdata } = storeToRefs(jeopardy);
const id = route.params.id;
</script>

<template>

  <template v-if="jdata">
    <ConfigLeafGroup name="Joker" :list="jdata.jokers"></ConfigLeafGroup>
    <ConfigSep />
    <ConfigLinkGroup name="Kategorien" :list="jdata.categories"></ConfigLinkGroup>
    <NuxtLink class="fixed bottom-4" to="/jeopardy/config">
      <ControlButton>Zurück zur Übersicht</ControlButton>
    </NuxtLink>
  </template>
  <TextBox v-else>Es wurde kein Quiz unter der ID {{ id }} gefunden.</TextBox>

</template>