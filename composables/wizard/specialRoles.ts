import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { useWizardRef } from "~/utils/wsutils";

export function useSpecialRoles() {
  const { data, sendWS } = useWizardConnection();
  const { result: playerRoles } = useWizardRef(data, "SelectedRoles", {});

  function requestSelectedRole(roleName: string) {
    sendWS({ type: "RequestSelectedRole", roleName });
  }

  const { result: currentRoleSelectingPlayer } = useWizardRef(
    data,
    "CurrentRoleSelectingPlayer",
    "",
  );

  return { playerRoles, requestSelectedRole, currentRoleSelectingPlayer };
}
