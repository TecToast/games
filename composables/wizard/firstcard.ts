import type { Card, LayedCard } from "~/utils/wizard/types";
import { watchMessage } from "~/utils/wsutils";
import { NOTHINGCARD } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useFirstCard(layedCards: Ref<LayedCard[]>) {
  const { data } = useWizardConnection();
  const firstCard = ref<Card>(NOTHINGCARD);
  watch(layedCards, (list) => {
    if (list.every((c) => c.card.color == "Nichts"))
      firstCard.value = NOTHINGCARD;
  });
  watchMessage(data, "PlayerCard", (msg) => {
    const card = msg.card as LayedCard;
    if (
      layedCards.value.every((c) => ["Nichts", "Narr"].includes(c.card.color))
    ) {
      firstCard.value = card.card;
    }
  });
  return firstCard;
}
