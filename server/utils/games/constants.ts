import type { Collection } from "mongodb";
import { getJeopardyDb, getNobodyIsPerfectDb } from "~/server/plugins/mongodb";
import type { QuizData as JeopardyQuizData } from "~/utils/jeopardy/types";
import type { QuizData as NIPQuizData } from "~/utils/nobodyisperfect/types";
import type { GameConfigBase } from "~/utils/types";

const collections: { [k: string]: () => Collection<GameConfigBase> } = {
  jeopardy: getJeopardyDb,
  nobodyisperfect: getNobodyIsPerfectDb,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultQuizData: { [k: string]: any } = {
  jeopardy: { categories: {}, jokers: ["R", "S"] } satisfies JeopardyQuizData,
  nobodyisperfect: { questions: [] } satisfies NIPQuizData,
};

export function getCollection(game: string) {
  return collections[game]?.();
}
