import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { useWebsocketRef, watchMessage } from "~/utils/wsutils";
import type { LayedCard, WizardState } from "~/utils/wizard/types";
import { NOTHINGCARD } from "~/utils/wizard/types";

export function useGamePhase(
  playersInLobby: Ref<string[]>,
  layedCards: Ref<LayedCard[]>,
) {
  const { data, status, sendWS } = useWizardConnection();
  const id = useRoute().params.id;
  const startButtonClickedAmount = ref(0);
  const noStart = computed(() => {
    const playerAmount = playersInLobby.value.length;
    return (
      playerAmount < 3 &&
      (playerAmount < 2 || startButtonClickedAmount.value < 10)
    );
  });

  const alreadyStarted = ref(false);
  function startGame() {
    if (alreadyStarted.value) return;
    if (noStart.value) {
      startButtonClickedAmount.value++;
      return;
    }
    alreadyStarted.value = true;
    sendWS("StartGame", {});
  }
  function leaveGame() {
    sendWS("LeaveGame", { gameID: id });
  }

  function stopGame() {
    if (confirm("Möchtest du das Spiel wirklich beenden?")) {
      leaveGame();
    }
  }

  until(status)
    .toBe("OPEN")
    .then(() => {
      sendWS("JoinGame", { gameID: id });
    });

  const { result: ranks } = useWebsocketRef<
    { player: string; points: number }[]
  >(data, "EndGame", "players", []);
  const gamephase = ref<WizardState>("lobby");
  watch(ranks, (newVal) => {
    if (newVal.length > 0) gamephase.value = "finished";
  });
  watchMessage(data, "GameStarted", (d) => {
    gamephase.value = "game";
    const players: string[] = d.players;
    layedCards.value = players.map(
      (x) => ({ player: x, card: NOTHINGCARD }) as LayedCard,
    );
  });

  return { startGame, noStart, leaveGame, stopGame, ranks, gamephase };
}
