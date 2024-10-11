import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useChangeStitchPrediction() {
  const { data, sendWS } = useWizardConnection();

  function changeStitchPrediction(value: number) {
    sendWS("ChangeStitchPrediction", {
      value,
    });
  }
  const { result: isChangeStitchModalActive } = useWebsocketRef(
    data,
    "ShowChangeStitchModal",
    "show",
    false,
  );

  return { isChangeStitchModalActive, changeStitchPrediction };
}
