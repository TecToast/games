import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useChangeStitchPrediction() {
  const { data, sendWS } = useWizardConnection();

  function changeStitchPrediction(value: number) {
    sendWS({ type: "ChangeStitchPrediction", value });
  }
  const { result: isChangeStitchModalActive } = useWizardRef(
    data,
    "ShowChangeStitchModal",
    false,
  );

  return { isChangeStitchModalActive, changeStitchPrediction };
}
