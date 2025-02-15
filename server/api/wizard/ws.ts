import { Game } from "~/server/utils/wizard/game";
import { GameManager } from "~/server/utils/wizard/gamemanger";
import pm from "~/server/utils/wizard/peermanager";
import type { WSMessage } from "~/utils/wizard/messages";
import { GamePhase } from "~/utils/wizard/types";

export default defineWebSocketHandler({
  upgrade: async (request) => {
    await requireUserSession(request);
  },
  open: async (peer) => {
    const { user } = await requireUserSession(peer);
    const { name } = user;
    console.log("User connected:", name);
    pm.register(name, peer);
    GameManager.updateOpenGames(name);
  },
  message: async (peer, message) => {
    const msg = message.json() as WSMessage;
    const name = (await requireUserSession(peer)).user.name;
    switch (msg.type) {
      case "CreateGame": {
        const id = GameManager.generateGameId();
        const g = new Game(id, name);
        GameManager.register(id, g);
        pm.send(name, { type: "GameCreated", gameID: id });
        GameManager.updateOpenGames();
        break;
      }
      case "JoinGame": {
        const game = GameManager.findGame(msg.gameID);
        if (!game) {
          pm.send(name, { type: "RedirectHome" });
          return;
        }
        GameManager.gameCache.set(name, game);
        if (game.phase == GamePhase.RUNNING) {
          game.updateLobby();
          game.sendCurrentState(name);
        } else {
          game.addPlayer(name);
        }
        break;
      }
      default:
        GameManager.gameCache.get(name)?.handleMessage(msg, name);
    }
  },
});
