<script lang="ts" setup>
const jeopardy = useJeopardyStore();
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  list: {
    type: Array,
    required: true
  }
})

function removeFromList(thing: unknown) {
  const index = props.list.indexOf(thing);
  if (index > -1) {
    props.list.splice(index, 1);
    jeopardy.markUnsaved();
  }
}

function createNew() {
  let thing: string | null = "";
  while (thing == "") {
    thing = prompt("Name of new thing?");
  }
  if (thing == null) return;
  if (props.list.includes(thing)) {
    alert("This name is already taken.");
    return;
  }
  props.list.push(thing);
  jeopardy.markUnsaved();
}
</script>

<template>
  <div>
    <div class="text-gray-300 font-bold text-3xl text-center mt-4">{{ props.name }}:</div>
    <div class="flex flex-col items-center w-[50vw] gap-4 mt-4">
      <div class="flex gap-2" v-for="thing of props.list">
        <ControlDiv> {{ thing }}</ControlDiv>
        <ConfigTrashCan @click="removeFromList(thing)" />
      </div>
      <ControlButton @click="createNew()">+ New</ControlButton>
    </div>
  </div>
</template>