import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { useWebsocketRef } from "~/utils/wsutils";

export function useSpecialRoles() {
    const { data, sendWS } = useWizardConnection();
    const { result: playerRoles } = useWebsocketRef<{
        [player: string]: string;
    }>(data, "SelectedRoles", "roles", {});

    function requestSelectedRole(roleName: string) {
        sendWS("RequestSelectedRole", {roleName})
    }

    const { result: currentRoleSelectingPlayer } = useWebsocketRef(
        data,
        "CurrentRoleSelectingPlayer",
        "currentPlayer",
        "",
      );

    return {playerRoles, requestSelectedRole, currentRoleSelectingPlayer};
}
