<script lang="ts" setup>
const route = useRoute();
const jeopardy = useJeopardyStore();
const { jdata } = storeToRefs(jeopardy);
const { id, category } = route.params;
const cat = computed(
  () =>
    jdata.value?.categories[
      //TODO: Fix this
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      jeopardy.nameUnwrapper?.categories[category.toString()]!
    ],
);

const mapper = (thing: string) => {
  if (Number.isNaN(Number.parseInt(thing))) return null;
  jeopardy.markUnsaved();
  return {
    question: {
      title: "Insert question here",
    },
    answer: {
      title: "Insert answer here",
    },
    used: false,
  };
};

function defaultPoints() {
  for (const key of ["100", "200", "300", "400", "500"]) {
    cat.value![key] = mapper(key.toString())!;
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <ConfigLinkGroup
      name="Points"
      :mapper
      :list="cat!"
      class="mt-4"
      :store="jeopardy"
    >
      <HelpModal name="Points">
        <p>Click on the points to add/edit questions and answers.</p>
        <br />
        <p>
          If there are no points visible, you normally want to use the "Use
          default point distribution" button.
        </p>
        <br />
        <p>
          Alternatively, you can add new points by clicking on the "+ New"
          button.
        </p>
      </HelpModal>
    </ConfigLinkGroup>
    <ControlButton
      v-if="Object.keys(cat!).length == 0"
      class="mt-4 bg-yellow-600"
      @click="defaultPoints()"
    >
      Use default point distribution (100 - 500)
    </ControlButton>
    <NuxtLink :to="`/jeopardy/config/${id}`" class="flex justify-center">
      <ControlButton class="mt-16">Back to {{ id }}</ControlButton>
    </NuxtLink>
  </div>
</template>
