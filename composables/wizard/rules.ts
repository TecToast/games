import { useWebsocketRef } from "~/utils/wsutils";
import { Rules } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useRules() {
  const { data, sendWS } = useWizardConnection();
  const { result: rules, notSet } = useWebsocketRef<{
    [k: string]: string;
  }>(
    data,
    "RuleChange",
    "rules",
    Object.fromEntries(
      Object.entries(Rules).map(([key, value]) => [key, value[0]]),
    ),
  );
  function switchRule(rule: string, value: string) {
    sendWS("RuleChangeRequest", { rule, value });
  }
  return { rules, notSet, switchRule };
}
