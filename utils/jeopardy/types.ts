import type { GameConfigBase } from "../types";

export type JeopardyData = GameConfigBase & QuizData;

export type QuizData = {
  categories: {
    [key: string]: Category;
  };
  jokers: string[];
};
export type Category = {
  [key: string]: Question;
};
export interface Question {
  question: QAData;
  answer: QAData;
  used: boolean;
}
export type QAData = {
  title: string;
  image?: string;
};

export type GameUserData = {
  points: number;
  usedJokers: string[];
};

export enum AnswerState {
  Correct,
  Incorrect,
  Unanswered,
}
