<template>
  <button :disabled="props.disabled"
    class="bg-[#3D8CD5] text-white text-xl min-w-24 min-h-10 rounded-lg flex justify-center items-center px-4">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()
</script>