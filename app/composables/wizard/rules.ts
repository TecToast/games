import { useWizardRef } from "~/utils/wsutils";
import { Rules, type Rule } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function useRules() {
  const { data, sendWS } = useWizardConnection();
  const { result: rules, notSet } = useWizardRef(
    data,
    "RuleChange",
    Object.fromEntries(
      Object.entries(Rules).map(([key, value]) => [key, value[0]]),
    ),
  );
  function switchRule(rule: Rule, value: string) {
    sendWS({ type: "RuleChangeRequest", rule, value });
  }
  return { rules, notSet, switchRule };
}
