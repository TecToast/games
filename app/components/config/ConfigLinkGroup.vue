<!-- eslint-disable @typescript-eslint/no-dynamic-delete -->
<!-- eslint-disable vue/no-mutating-props -->
<script lang="ts" setup>
import { toID } from "~/stores/jeopardy";

const route = useRoute();
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  list: {
    type: [Array, Object],
    required: true,
  },
  mapper: {
    type: Function,
    default: (thing: string) => thing,
  },
  store: {
    type: Object,
    required: true,
  },
});

function removeFromList(thing: string) {
  const confirm = window.confirm(`Should "${thing}" really be deleted?`);
  if (!confirm) return;
  if (!Array.isArray(props.list)) {
    delete props.list[thing];
    props.store.markUnsaved();
    return;
  }
  const index = props.list.indexOf(thing);
  if (index > -1) {
    props.list.splice(index, 1);
    props.store.markUnsaved();
  }
}

function createNew() {
  let thing: string | null = "";

  const isArray = Array.isArray(props.list);
  while (thing == "") {
    thing = prompt("Name of new thing?");
  }
  if (thing == null) return;
  const mappedResult = props.mapper(thing);
  if (mappedResult == null) return alert("Ungültige Eingabe!");
  if (
    (isArray && props.list.includes(thing)) ||
    (!isArray && props.list[thing])
  ) {
    alert("This name is already taken.");
    return;
  }
  if (!isArray) {
    props.list[thing] = mappedResult == thing ? {} : mappedResult;
    props.store.markUnsaved();
    return;
  }
  props.list.push(mappedResult);
  props.store.markUnsaved();
}
const iterateString = computed(() => {
  if (Array.isArray(props.list)) return props.list;
  return Object.keys(props.list);
});
</script>

<template>
  <div>
    <div class="flex items-center justify-center gap-2">
      <div class="text-center text-3xl font-bold text-gray-300">
        {{ props.name }}:
      </div>
      <slot />
    </div>
    <div class="mt-4 flex w-[50vw] flex-col items-center gap-4">
      <div v-for="thing of iterateString" :key="thing" class="flex gap-2">
        <NuxtLink :to="`${route.path}/${toID(thing)}`">
          <ControlButton class="h-full"> {{ thing }}</ControlButton>
        </NuxtLink>
        <ConfigTrashCan @click="removeFromList(thing)" />
      </div>
      <ControlButton @click="createNew()">+ New</ControlButton>
    </div>
  </div>
</template>
