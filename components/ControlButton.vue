<template>
  <button
    :disabled="props.disabled"
    class="flex min-h-10 min-w-24 items-center justify-center rounded-lg bg-[#3D8CD5] px-4 text-xl text-white"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
}>();
</script>
