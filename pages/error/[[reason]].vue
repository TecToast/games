<script setup lang="ts">
const reasons = {
  notwhitelisted:
    "To be able to login with discord, you must be whitelisted by the admin.",
};
</script>

<template>
  <DefaultBackground>
    <h1 class="mt-8 text-center text-4xl text-white">
      {{
        reasons[$route.params.reason] ||
        "Unknown error occured, please try again later."
      }}
    </h1>
  </DefaultBackground>
</template>
