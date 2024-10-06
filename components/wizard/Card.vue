<script setup lang="ts">
import {
  type Card,
  type CardType,
  convertCardToHref,
  isCard,
} from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { useColorSelect } from "~/composables/wizard/colorSelect";

const props = defineProps<{
  card: Card;
  type: CardType;
  firstCard?: Card;
  playerCards?: Card[];
  playersTurn?: boolean;
  isPredict?: boolean;
  firstCome?: string;
  bombFirst?: boolean;
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
    props.card.color == "Spezial" ||
    props.firstCard?.color == "Zauberer" ||
    props.bombFirst ||
    props.playerCards?.every((c) => c.color != props.firstCard?.color) ||
    props.card.color == props.firstCard?.color
  );
});
const { sendWS } = useWizardConnection();

function onClick() {
  if (!clickable.value) return;
  if (
    isCard(props.card, "Spezial", 9.75) ||
    isCard(props.card, "Spezial", 7.5)
  ) {
    const selectColorCard = useState<Card | null>("selectColorCard");
    selectColorCard.value = props.card;
    return;
  }
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
          ? 'outline-dashed outline-4 outline-offset-0 outline-fuchsia-600'
          : type == 'hand'
            ? isLegal
              ? 'border-2 border-green-400'
              : 'border-2 border-red-400'
            : '',
      type == 'layed' && (card.value == 7.5 || card.value == 9.75)
        ? `border-4 border-${card.color == 'Grün' ? 'green' : card.color == 'Rot' ? 'red' : card.color == 'Blau' ? 'blue' : card.color == 'Gelb' ? 'yellow' : ''}-400`
        : '',
    ]"
    style="max-width: 150px"
  />
  <span
    class="border-blue-400 border-green-400 border-red-400 border-yellow-400"
  ></span>
</template>

<style scoped></style>
