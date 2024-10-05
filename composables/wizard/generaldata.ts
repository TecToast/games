import { useWebsocketRef } from "~/utils/wsutils";
import type { Card } from "~/utils/wizard/types";
import { NOTHINGCARD } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useGeneralData() {
  const { data } = useWizardConnection();
  const { result: currentPlayer } = useWebsocketRef(
    data,
    "CurrentPlayer",
    "player",
    "",
  );
  const { result: round } = useWebsocketRef(data, "Round", "round", 1);
  const { result: firstCome } = useWebsocketRef(data, "Round", "firstCome", "");
  const { result: trump } = useWebsocketRef<Card>(
    data,
    "Trump",
    "trump",
    NOTHINGCARD,
  );
  const { result: isPredict } = useWebsocketRef(
    data,
    "IsPredict",
    "isPredict",
    true,
  );
  const { result: playersInLobby } = useWebsocketRef<string[]>(
    data,
    "GameInfo",
    "players",
    [],
  );
  const { result: currentStitchWinner } = useWebsocketRef<string|null>(
    data,
    "NewSubRound",
    "winner",
    "",
  );
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
