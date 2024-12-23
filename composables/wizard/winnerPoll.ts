import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useWinnerPoll() {
  const { data, sendWS } = useWizardConnection();

  function voteForWinner(value: string) {
    sendWS("VoteForWinner", {
      value,
    });
  }
  const { result: isWinnerPollModalActive } = useWebsocketRef(
    data,
    "ShowWinnerPollModal",
    "show",
    false,
  );

  return { isWinnerPollModalActive, voteForWinner };
}
