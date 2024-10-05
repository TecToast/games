import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useTrumpShift() {
  const { data } = useWizardConnection();
  const { result: shiftData } = useWebsocketRef<{
    [color: string]: number;
  }>(data, "Trump", "shifted", {});
  return computed(() => {
    let x = "";
    for (const [color, amount] of Object.entries(shiftData.value)) {
      if (amount == 0) continue;
      if (x.length > 0) x += ", ";
      x += `${amount}x ${color}`;
    }
    if (x.length > 0) x = " - Übersprungen: " + x;
    return x;
  });
}
