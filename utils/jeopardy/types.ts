export type JeopardyData = {
    categories: {
        [key: string]: Category;
    },
    jokers: string[],
    participants: {
        [key: string]: UserData;
    },
    participantList: string[],
    host: string
    ;
}
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
}

export type UserData = {
    avatarUrl: string,
    displayName: string,
    points: number;
    jokers: string[];
}

export enum AnswerState {
    Correct,
    Incorrect,
    Unanswered
}

