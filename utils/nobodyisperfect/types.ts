export type NobodyIsPerfectData = HasUser<UserData> & {
  questions: Question[];
  host: string;
};
export type Question = {
  question: NIPQData;
  answer: NIPQData;
};
export type UserData = {
  avatarUrl: string;
  displayName: string;
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
