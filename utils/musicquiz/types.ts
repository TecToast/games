export type JeopardyData = {
  tracks: Track[];
  jokers: string[];
  participants: {
    [key: string]: UserData;
  };
  participantList: string[];
  host: string;
};

export type Track = {};

export type UserData = {
  avatarUrl: string;
  displayName: string;
  points: number;
  jokers: string[];
};
