import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { useWizardRef } from "~/utils/wsutils";

export function useWinnerPoll() {
  const { data, sendWS } = useWizardConnection();

  function voteForWinner(value: string) {
    sendWS({ type: "VoteForWinner", value });
  }
  const { result: isWinnerPollModalActive } = useWizardRef(
    data,
    "ShowWinnerPollModal",
    false,
  );

  return { isWinnerPollModalActive, voteForWinner };
}
