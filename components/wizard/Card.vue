<script setup lang="ts">
import {
  type Card,
  type CardType,
  convertCardToHref,
} from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

const props = defineProps<{
  card: Card;
  type: CardType;
  firstCard?: Card;
  playerCards?: Card[];
  playersTurn?: boolean;
  isPredict?: boolean;
  firstCome?: string;
}>();
const src = computed(() => {
  return convertCardToHref(props.card);
});
const clickable = computed(() => {
  const type = props.type;
  if (type != "hand") return false;
  if (!props.playersTurn) return false;
  if (props.isPredict) return false;
  return isLegal.value;
});
const isLegal = computed(() => {
  return (
    props.card.color == "Zauberer" ||
    props.card.color == "Narr" ||
    props.firstCard?.color == "Zauberer" ||
    props.playerCards?.every((c) => c.color != props.firstCard?.color) ||
    props.card.color == props.firstCard?.color
  );
});
const { sendWS } = useWizardConnection();

function onClick() {
  if (!clickable.value) return;
  sendWS("LayCard", { card: props.card });
}
</script>
<template>
  <img
    :src
    :alt="`${card.color} ${card.value}`"
    @click="onClick"
    class="m-0 scale-100 transform rounded transition-transform duration-300"
    :class="[
      type != 'hand' || clickable || (isPredict && firstCome != '')
        ? 'brightness-100'
        : 'brightness-50',
      type == 'hand' ? 'hover:scale-110 hover:cursor-pointer' : '',
      clickable ? 'hover:border-4 hover:border-blue-400' : '',
      type == 'trump'
        ? 'border-4 border-yellow-400'
        : type == 'layed' &&
            card.color != 'Nichts' &&
            firstCard?.color == card.color &&
            firstCard?.value == card.value
          ? 'border-4 border-lime-400'
          : type == 'hand'
            ? isLegal
              ? 'border-2 border-green-400'
              : 'border-2 border-red-400'
            : '',
    ]"
    style="max-width: 150px"
  />
</template>

<style scoped></style>
