import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import type { Color, Card } from "~/utils/wizard/types";

export function useColorSelect() {
  const { sendWS } = useWizardConnection();
  const selectColorCard = useState<Card | null>("selectColorCard");

  function layCardWithColor(color: Color) {
    if (!selectColorCard.value) return;
    sendWS({
      type: "LayCard",
      card: selectColorCard.value,
      selectedColor: color,
    });
  }

  return { selectColorCard, layCardWithColor };
}
