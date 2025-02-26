<script setup lang="ts">
const reasons: { [k: string]: string } = {
  notwhitelisted:
    "To be able to login with discord, you must be whitelisted by the admin.",
};
const route = useRoute();
</script>

<template>
  <DefaultBackground>
    <h1 class="mt-8 text-center text-4xl text-white">
      {{
        reasons[route.params.reason.toString()] ||
        "Unknown error occured, please try again later."
      }}
    </h1>
  </DefaultBackground>
</template>
