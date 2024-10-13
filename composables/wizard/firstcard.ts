import type { Card, LayedCard } from "~/utils/wizard/types";
import { watchMessage } from "~/utils/wsutils";
import { isCard, NOTHINGCARD } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useFirstCard(layedCards: Ref<LayedCard[]>) {
  const { data } = useWizardConnection();
  const firstCard = ref<Card>(NOTHINGCARD);
  watchMessage(data, "PlayerCard", (msg) => {
    const layCard = msg.card as LayedCard;
    if (firstCard.value.color != "Nichts") {
      return;
    }
    // Bei Regenbogenkarte gilt: layCard.card.color = selectedColor (und nicht layCard.card.color = "Spezial")
    if (
      layCard.card.color == "Narr" ||
      (layCard.card.color == "Spezial" && layCard.card.value != 3)
    ) {
      return;
    }
    firstCard.value = layCard.card;
  });

  function resetFirstCard() {
    firstCard.value = NOTHINGCARD;
  }

  return { firstCard, resetFirstCard };
}
