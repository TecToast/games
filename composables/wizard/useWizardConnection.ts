import { watchMessage } from "~/utils/wsutils";
import type { OpenGamesData } from "~/utils/wizard/types";

const useWizardConnectionTemplate = () => {
  const ws = useTypedWebsocket(
    process.env.NODE_ENV === "development"
      ? `ws://localhost:9934/api/wizard/ws`
      : `wss://games.tectoast.de/api/wizard/ws`,
  );
  const openGames = useState<OpenGamesData>(
    "openGames" /*, () => {
    return { notSet: true, games: [] };
  }*/,
  );
  watchMessage(ws.data, "OpenGames", (d) => {
    openGames.value = d.games;
  });
  return ws;
};

export const useWizardConnection = createSharedComposable(
  useWizardConnectionTemplate,
);
