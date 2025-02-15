import type { Card } from "~/utils/wizard/types";
import { watchWizard } from "~/utils/wsutils";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { NOTHINGCARD } from "~/utils/wizard/specialcards";

export function useFirstCard() {
  const { data } = useWizardConnection();
  const firstCard = ref<Card>(NOTHINGCARD);
  watchWizard(data, "PlayerCard", (msg) => {
    const layCard = msg.card;
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
