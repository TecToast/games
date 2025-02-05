import { GamePhase, OpenGamesData } from "~/utils/wizard/types";
import { Game } from "./game";
import { Peer } from "crossws";
import { OpenGames } from "~/utils/wizard/messages";
import pm from "./peermanager";

export const GameManager = {
  games: new Map<number, Game>(),
  gameCache: new Map<string, Game>(),
  updateOpenGames(peer?: Peer) {
    const openGames: OpenGamesData = [];
    this.games.forEach((game, id) => {
      if (game.phase === GamePhase.LOBBY) {
        openGames.push({ owner: game.owner, id });
      }
    });
    /*const openGames: OpenGamesData = this.games
      .entries()
      .filter(([_, game]) => game.phase === GamePhase.LOBBY)
      .map(([id, game]) => ({ owner: game.owner, id }))
      .toArray();*/
    const msg = { type: "OpenGames", games: openGames } as OpenGames;
    if (peer) {
      peer.send(msg);
    } else {
      pm.broadcast(msg);
    }
  },
  findGame(id: number) {
    return this.games.get(id);
  },
  register(id: number, game: Game) {
    this.games.set(id, game);
  },
  generateGameId() {
    let id = 0;
    while (this.games.has(id)) {
      id++;
    }
    return id;
  },
  removeGame(id: number) {
    const game = this.games.get(id);
    this.games.delete(id);
    if (game) {
      game.broadcast({ type: "RedirectHome" });
      this.updateOpenGames();
    }
  },
};
