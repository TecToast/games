import { watchWizard } from "~/utils/wsutils";
import type { OpenGamesData } from "~/utils/wizard/types";
import type { WSMessage } from "~/utils/wizard/messages";

const useWizardConnectionTemplate = () => {
  const config = useRuntimeConfig();
  const ws = useTypedWebsocket<WSMessage>(
    process.env.NODE_ENV === "development"
      ? `ws://localhost:3000/api/wizard/ws`
      : `wss://${config.public.host}/api/wizard/ws`,
  );
  const openGames = useState<OpenGamesData>(
    "openGames" /*, () => {
    return { notSet: true, games: [] };
  }*/,
  );
  watchWizard(ws.data, "OpenGames", (d) => {
    openGames.value = d.games;
  });
  return ws;
};

export const useWizardConnection = createSharedComposable(
  useWizardConnectionTemplate,
);
