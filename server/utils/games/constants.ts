import { Collection } from "mongodb";
import { jeopardyDb, nobodyIsPerfectDb } from "~/server/plugins/mongodb";
import { type QuizData as JeopardyQuizData } from "~/utils/jeopardy/types";
import { type QuizData as NIPQuizData } from "~/utils/nobodyisperfect/types";
import { type GameConfigBase } from "~/utils/types";

export const collections: { [k: string]: Collection<GameConfigBase> } = {
  jeopardy: jeopardyDb,
  nobodyisperfect: nobodyIsPerfectDb,
};

export const defaultQuizData: { [k: string]: any } = {
  jeopardy: { categories: {}, jokers: ["R", "S"] } satisfies JeopardyQuizData,
  nobodyisperfect: { questions: [] } satisfies NIPQuizData,
};
