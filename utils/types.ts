export type GameMeta = {
  displayName: string;
  url: string;
};
export interface BaseMessage {
  type: string;
}
export type GameConfigBackendBase = {
  participantsList: string[];
  host: string;
  id: string;
};
export type GameConfigBase<GameUserData> = GameConfigBackendBase & {
  participants: {
    [key: string]: UserData<GameUserData>;
  };
};
export type UserData<GameData> = {
  avatarUrl: string;
  displayName: string;
  data: GameData;
};

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
