import Card from "~/components/wizard/Card.vue";

export const Rules: { [rule: string]: string[] } = {
  Punkte: ["Normal", "Max. 30"],
  Zauberer: ["Normal", "Mittlerer Zauberer", "Letzter Zauberer"],
  Ansage: ["Nacheinander", "Blind"],
  Trumpf: ["Normal", "Nur Farben"],
  Spezialkarten: ["Aktiviert", "Deaktiviert"],
  Spezialrollen: ["Deaktiviert", "Freie Auswahl", "Vorgegeben", "Geheim"],
};

export const SpecialRolesDescriptions: { [role: string]: string } = {
  "Der Sprengmeister": "Du bekommst immer die Bombe, falls sie im Spiel ist",
  "Der Obernarr":
    "Du bekommst immer den ersten Narren im Stapel, bevor normal ausgeteilt wird",
  "Der Knecht":
    "Du bekommts immer so viele Knechte/Mägde wie möglich, bevor normal ausgeteilt wird",
  "Der Schadenfrohe":
    "Du bekommst 5 Punkte jedes mal wenn ein anderer Spieler Minuspunkte bekommt",
  "Der Pessimist":
    "Du bekommst 50 Punkte wenn du korrekt angesagt 0 Stiche machst, bekommts dafür aber für maximal 12/Spielerzahl Stiche Punkte",
  "Der Optimist":
    "Du bekommts 5 Punkte pro gemachtem Stich wenn du eins neben deiner Vorhersage liegst, dafür kein +20 bei unter 12/Spielerzahl Stichen",
  "Der Gambler":
    "Du bekommst 20 Punkte pro gemachtem Stich wenn du richtig liegst, dafür aber kein +20 und -20 Punkte pro Stich daneben (Glücksspiel kann süchtig machen)",
  "Der Zaubermeister":
    "Du hast jedes mal wenn ein anderer einen Zauberer ausgeteteilt bekommt eine 25% Chance ihn zu stehlen.",
  "Das rote Schaf":
    "Du hast eine 50% Chance rote Karten zu stehlen. Trumpf Karten von Farben ohne Schaf werden zu 50% Chance übersprungen.",
  "Das gelbe Schaf":
    "Du hast eine 50% Chance gelbe Karten zu stehlen. Trumpf Karten von Farben ohne Schaf werden zu 50% Chance übersprungen.",
  "Das grüne Schaf":
    "Du hast eine 50% Chance grüne Karten zu stehlen. Trumpf Karten von Farben ohne Schaf werden zu 50% Chance übersprungen.",
  "Das blaue Schaf":
    "Du hast eine 50% Chance blaue Karten zu stehlen. Trumpf Karten von Farben ohne Schaf werden zu 50% Chance übersprungen.",
  "Der Gierige":
    "Du bekommst immernoch 10 Punkte pro angesagtem Stich und 5 Punkte pro zusätzlichem Stich wenn du über deiner Ansage liegst. Dafür kein +20.",
  "Der Dieb":
    "Wenn du einen Dieb spielst hast du eine 50% Chanche den Stich zu klauen.",
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
  | "Spezial"
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
export type SelectChangeCard = "selectCard" | "waitForOthers" | "nothing";

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
  for (let i = 1; i <= 1; i++) {
    allCards.push({ color: "Spezial", value: i });
  }
  allCards.push({ color: "Spezial", value: 7.5 });
  allCards.push({ color: "Spezial", value: 9.75 });
  return allCards;
})();

export function convertCardToHref(card: Card): string {
  const c = card.color;
  if (c == "Nichts") return "/api/wizard/cardimages/empty.webp";
  const color =
    card.value == 7.5 || card.value == 9.75
      ? "S"
      : c == "Grün"
        ? "Gruen"
        : c == "Zauberer"
          ? "Z"
          : c == "Narr"
            ? "N"
            : c == "Spezial"
              ? "S"
              : c;
  return `/api/wizard/cardimages/${color}_${card.value}.webp`;
}

export function isCard(
  card: Card | undefined,
  color: Color,
  value: number,
): boolean {
  if (!card) return false;
  return card.color == color && card.value == value;
}
