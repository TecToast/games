import { Collection } from "mongodb";
import { jeopardyDb, nobodyIsPerfectDb } from "~/server/plugins/mongodb";
import {
  GameUserData as JeopardyGameUserData,
  QuizData as JeopardyQuizData,
} from "~/utils/jeopardy/types";
import {
  GameUserData as NIPGameUserData,
  QuizData as NIPQuizData,
} from "~/utils/nobodyisperfect/types";
import { GameConfigBackendBase } from "~/utils/types";

export const collections: { [k: string]: Collection<GameConfigBackendBase> } = {
  jeopardy: jeopardyDb,
  nobodyisperfect: nobodyIsPerfectDb,
};
export const defaultGameUserData: { [k: string]: any } = {
  jeopardy: { points: 0, usedJokers: [] } satisfies JeopardyGameUserData,
  nobodyisperfect: { points: 0 } satisfies NIPGameUserData,
};
export const defaultQuizData: { [k: string]: any } = {
  jeopardy: { categories: {}, jokers: ["R", "S"] } satisfies JeopardyQuizData,
  nobodyisperfect: { questions: [] } satisfies NIPQuizData,
};
