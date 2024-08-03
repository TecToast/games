<script lang="ts" setup>
const route = useRoute();
</script>

<template>
  <div class="flex justify-center mt-4">
    <TextBox class="px-4">{{ route.fullPath.substring('/jeopardy/config/'.length) }}</TextBox>
  </div>
</template>