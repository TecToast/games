export type MusicQuizData = HasUser<UserData> & {
  tracks: Track[];
};

export type Track = {
  name: string;
  game: string;
  type: string;
  url: string;
  region: string;
};

export type UserData = {
  avatarUrl: string;
  displayName: string;
  points: number;
  guess: string;
  visible: boolean;
};
