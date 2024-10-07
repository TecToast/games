import type { Card, LayedCard } from "~/utils/wizard/types";
import { watchMessage } from "~/utils/wsutils";
import { isCard, NOTHINGCARD } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useFirstCard(layedCards: Ref<LayedCard[]>) {
  const { data } = useWizardConnection();
  const firstCard = ref<Card>(NOTHINGCARD);
  const bombFirst = ref(false);
  watchMessage(data, "PlayerCard", (msg) => {
    const card = msg.card as LayedCard;
    if (
      layedCards.value.every(
        (c) =>
          ["Nichts", "Narr"].includes(c.card.color) ||
          isCard(c.card, "Spezial", 1),
      )
    ) {
      firstCard.value = card.card;
    }
  });
  function resetFirstCard() {
    firstCard.value = NOTHINGCARD;
    bombFirst.value = false;
  }
  return { firstCard, resetFirstCard, bombFirst };
}
