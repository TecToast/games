<script lang="ts" setup>
const isOpen = ref(false);
const props = defineProps<{
  name: string;
}>();
</script>

<template>
  <button
    @click="isOpen = true"
    class="h-8 w-8 rounded-full bg-blue-700 text-xl text-white"
    :class="$attrs.class"
  >
    ?
  </button>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="text-2xl font-bold text-gray-300">Help / {{ name }}</div>
      </template>
      <div class="text-gray-200">
        <slot></slot>
      </div>
    </UCard>
  </UModal>
</template>
