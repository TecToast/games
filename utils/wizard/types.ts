export const Rules: { [rule: string]: string[] } = {
  Punkte: ["Normal", "Max. 30"],
  Zauberer: ["Normal", "Letzter Zauberer"],
  Ansage: ["Nacheinander", "Blind"],
  Trumpf: ["Normal", "Nur Farben"],
};

export const NOTHINGCARD = { color: "Nichts", value: 0 } as Card;

export type WizardState = "lobby" | "game" | "finished";

export type OpenGamesData = { owner: string; id: number }[];

export type Color =
  | "Rot"
  | "Gelb"
  | "Grün"
  | "Blau"
  | "Zauberer"
  | "Narr"
  | "Nichts";
export type Card = {
  color: Color;
  value: number;
};
export type CardType = "trump" | "layed" | "hand";
export type LayedCard = {
  card: Card;
  player: string;
};
