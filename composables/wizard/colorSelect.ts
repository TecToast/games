import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { watchMessage } from "~/utils/wsutils";
import { Card, Color, LayedCard, NOTHINGCARD } from "~/utils/wizard/types";

export function useColorSelect() {
  const { sendWS } = useWizardConnection();
  const selectColorCard = useState<Card | null>("selectColorCard");

  function layCardWithColor(color: Color) {
    sendWS("LayCard", { card: selectColorCard.value, selectedColor: color });
  }

  return { selectColorCard, layCardWithColor };
}
