export type NobodyIsPerfectData = HasUser<UserData> & {
  questions: Question[];
  host: string;
};
export type Question = {
  question: { title: string; image?: string };
  answer: string;
};
export type UserData = {
  avatarUrl: string;
  displayName: string;
  points: number;
  currentAnswer?: string;
  selectedIndex?: number;
};

export type State = "overview" | "question" | "answer";
