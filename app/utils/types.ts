import type { GameUserData as JeopardyGameUserData } from "~/utils/jeopardy/types";
import type { GameUserData as NIPGameUserData } from "~/utils/nobodyisperfect/types";

export type GameMeta = {
  displayName: string;
  url: string;
};
export interface BaseMessage {
  type: string;
}
export type GameConfigBase = {
  participantsList: string[];
  host: string;
  id: string;
};

export type ParticipantData = {
  avatarUrl: string;
  displayName: string;
};
export type ParticipantDataWithId = {
  id: string;
} & ParticipantData;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultGameUserData: { [k: string]: any } = {
  jeopardy: { points: 0, usedJokers: [] } satisfies JeopardyGameUserData,
  nobodyisperfect: { points: 0 } satisfies NIPGameUserData,
};

export function getDefaultGameUserData(gameId: string) {
  return JSON.parse(JSON.stringify(defaultGameUserData[gameId]));
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
