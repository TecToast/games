import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { watchMessage } from "~/utils/wsutils";
import { Card, Color, LayedCard, NOTHINGCARD } from "~/utils/wizard/types";

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
