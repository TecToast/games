import type { GameConfigBase } from "../types";

export type NobodyIsPerfectData = GameConfigBase & QuizData;

export type QuizData = {
  questions: Question[];
};
export type Question = {
  question: NIPQData;
  answer: NIPQData;
};
export type GameUserData = {
  points: number;
  currentAnswer?: string;
  selectedIndex?: number;
};

export type NIPQData = {
  title: string;
  file?: string;
  audio?: string;
};

export type State = "overview" | "question" | "answer";
