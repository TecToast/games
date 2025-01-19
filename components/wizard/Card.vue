<script setup lang="ts">
import {
  type Card,
  type CardType,
  convertCardToHref,
  isCard,
  type SelectChangeCard,
  CardsDescriptions
} from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

const selectChangeCardState = defineModel<SelectChangeCard>(
  "selectChangeCardState",
  { default: "nothing" },
);
const props = defineProps<{
  card: Card;
  type: CardType;
  firstCard?: Card;
  playerCards?: Card[];
  playersTurn?: boolean;
  isPredict?: boolean;
  firstCome?: string;
}>();
const emit = defineEmits(["removeCard"]);
const src = computed(() => {
  return convertCardToHref(props.card);
});
const clickable = computed(() => {
  const type = props.type;
  if (type != "hand") return false;
  if (props.isPredict) return false;
  if (selectChangeCardState.value == "waitForOthers") return false;
  if (selectChangeCardState.value == "selectCard") return true;
  if (!props.playersTurn) return false;
  return isLegal.value;
});
const isLegal = computed(() => {
  return (
    props.card.color == "Zauberer" ||
    props.card.color == "Narr" ||
    props.card.color == "Spezial" ||
    props.firstCard?.color == "Zauberer" ||
    isCard(props.firstCard, "Spezial", 3) ||
    props.playerCards?.every((c) => c.color != props.firstCard?.color) ||
    props.card.color == props.firstCard?.color
  );
});
const { sendWS } = useWizardConnection();

function onClick() {
  if (!clickable.value) return;
  if (selectChangeCardState.value == "selectCard") {
    sendWS("ChangeCard", { card: props.card });
    selectChangeCardState.value = "waitForOthers";
    emit("removeCard", props.card);
    return;
  }
  if (
    isCard(props.card, "Spezial", 9.75) ||
    isCard(props.card, "Spezial", 7.5) ||
    isCard(props.card, "Spezial", -1) ||
    isCard(props.card, "Spezial", 14) ||
    isCard(props.card, "Spezial", 69)
  ) {
    const selectColorCard = useState<Card | null>("selectColorCard");
    selectColorCard.value = props.card;
    return;
  }
  sendWS("LayCard", { card: props.card });
}
</script>
<template>
  <UTooltip
    :text="
      CardsDescriptions[card.color + card.value] ??
      (card.color != 'Nichts' ?
        (card.color == 'Narr' || card.color == 'Zauberer' ?
          card.color
        : card.color + ' ' + card.value)
        : "Keine Beschreibung verfügbar")
    "
    :popper="{ placement: 'bottom' }"
    :open-delay="800"
    :ui="{ width: 'max-w-screen-xl' }"
    class="m-0 scale-100 transform rounded transition-transform duration-300"
    :class="[
      type != 'hand' || clickable || (isPredict && firstCome != '')
        ? 'brightness-100'
        : 'brightness-50',
      type == 'hand' ? 'hover:scale-110 hover:cursor-pointer' : '',
      clickable ? 'hover:border-4 hover:border-blue-400' : '',
      type == 'trump'
        ? 'border-4 border-fuchsia-800'
        : type == 'layed' &&
            card.color != 'Nichts' &&
            firstCard?.color == card.color &&
            firstCard?.value == card.value
          ? 'outline-3 outline-dotted outline-offset-0 outline-fuchsia-800'
          : type == 'hand' && selectChangeCardState == 'nothing'
            ? isLegal
              ? 'border-2 border-green-400'
              : 'border-2 border-red-400'
            : '',
      type == 'layed' &&
      (card.value == 7.5 ||
        card.value == 9.75 ||
        card.value == -1 ||
        card.value == 14 ||
        card.value == 69)
        ? `border-4 border-${card.color == 'Grün' ? 'green' : card.color == 'Rot' ? 'red' : card.color == 'Blau' ? 'blue' : card.color == 'Gelb' ? 'yellow' : ''}-400`
        : '',
    ]"
    style="max-width: 150px"
  >
  <img
    :src
    :alt="`${card.color} ${card.value}`"
    @click="onClick"
  />
  </UTooltip>
  
</template>

<style scoped></style>
