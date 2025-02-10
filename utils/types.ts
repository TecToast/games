export type GameMeta = {
  displayName: string;
  url: string;
};
export interface BaseMessage {
  type: string;
}
export const allGames: Record<string, GameMeta> = {
  jeopardy: {
    displayName: "Jeopardy",
    url: "/jeopardy/config",
  },
  wizard: {
    displayName: "Wizard",
    url: "/wizard",
  },
  nobodyisperfect: {
    displayName: "Nobody is perfect",
    url: "/nobodyisperfect/config",
  },
};
