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
export const AllCards: Card[] = (function () {
  let allCards: Card[] = [];
  for (let color of ["Rot", "Gelb", "Grün", "Blau"]) {
    for (let value = 1; value <= 13; value++) {
      allCards.push(<Card>{ color, value });
    }
  }
  for (let i = 1; i <= 4; i++) {
    allCards.push({ color: "Zauberer", value: i });
    allCards.push({ color: "Narr", value: i });
  }
  return allCards;
})();

export function convertCardToHref(card: Card): string {
  const c = card.color;
  if (c == "Nichts") return "/api/wizard/cardimages/empty.webp";
  const color =
    c == "Grün" ? "Gruen" : c == "Zauberer" ? "Z" : c == "Narr" ? "N" : c;
  return `/api/wizard/cardimages/${color}_${card.value}.webp`;
}
