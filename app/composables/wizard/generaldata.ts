import { useWizardRef } from "~/utils/wsutils";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { NOTHINGCARD } from "~/utils/wizard/specialcards";

export function useGeneralData() {
  const { data } = useWizardConnection();
  const { result: currentPlayer } = useWizardRef(data, "CurrentPlayer", "");
  const { result: round } = useWizardRef(data, "Round", 1);
  const { result: firstCome } = useWizardRef(data, "FirstCome", "");
  const { result: trump } = useWizardRef(data, "Trump", NOTHINGCARD);
  const { result: isPredict } = useWizardRef(data, "IsPredict", true);
  const { result: playersInLobby } = useWizardRef(data, "GameInfo", []);
  const { result: currentStitchWinner } = useWizardRef(data, "Winner", "");
  watch(currentStitchWinner, (newWinner) => {
    if (newWinner != "") {
      currentPlayer.value = "";
    }
  });
  return {
    currentPlayer,
    round,
    firstCome,
    trump,
    isPredict,
    playersInLobby,
    currentStitchWinner,
  };
}
