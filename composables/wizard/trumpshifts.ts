import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useTrumpShift() {
  const { data } = useWizardConnection();
  const { result: shiftData } = useWebsocketRef<{
    Zauberer?: number;
    Narr?: number;
  }>(data, "Trump", "shifted", {});
  return computed(() => {
    let x = " ";
    const magicians = shiftData.value.Zauberer ?? 0;
    const fools = shiftData.value.Narr ?? 0;
    if (magicians != 0) x += magicians + " Zauberer";
    if (fools != 0) {
      if (x.length > 2) x += " und ";
      x += fools + " Narr" + (fools > 1 ? "en" : "");
    }
    if (x.length > 2) x += " übersprungen";
    return x;
  });
}
