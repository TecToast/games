import type { BaseMessage } from "../types";

export type NIPMessage =
  | AcceptAnswers
  | PlayTrackOfQuestion
  | PlayTrackOfAnswer
  | PlayYT
  | StopTrack
  | Join
  | Answer
  | AllAnswers;

interface AcceptAnswers extends BaseMessage {
  type: "AcceptAnswers";
  state: boolean;
  deleteAnswers: boolean;
  saveIndex: number;
}

interface PlayTrackOfQuestion extends BaseMessage {
  type: "PlayTrackOfQuestion";
  questionIndex: number;
}

interface PlayTrackOfAnswer extends BaseMessage {
  type: "PlayTrackOfAnswer";
  questionIndex: number;
}

interface PlayYT extends BaseMessage {
  type: "PlayYT";
  url: string;
}

interface StopTrack extends BaseMessage {
  type: "StopTrack";
}

interface Join extends BaseMessage {
  type: "Join";
}

interface Answer extends BaseMessage {
  type: "Answer";
  user: string;
  answer: string;
}

interface AllAnswers extends BaseMessage {
  type: "AllAnswers";
  answers: Record<string, string>;
}
