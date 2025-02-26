export const Rules = {
  Punkte: ["Normal", "Max. 30"],
  Zauberer: ["Normal", "Mittlerer Zauberer", "Letzter Zauberer"],
  Ansage: ["Blind", "Nacheinander"],
  Trumpf: ["Nur Farben", "Normal"],
  Spezialkarten: ["Aktiviert", "Deaktiviert"],
  Memekarten: ["Aktiviert", "Deaktiviert"],
  Spezialrollen: ["Deaktiviert", "Freie Auswahl", "Vorgegeben", "Geheim"],
};
export type Rule = keyof typeof Rules;

export const SpecialRolesDescriptions: { [role: string]: string } = {
  "Der Sprengmeister": "Du bekommst immer die Bombe, falls sie im Spiel ist",
  "Der Obernarr":
    "Du bekommst immer den ersten Narren im Stapel, bevor normal ausgeteilt wird",
  "Der Knecht":
    "Du bekommst immer so viele Knechte/Mägde wie möglich, bevor normal ausgeteilt wird",
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
    "Wenn du einen Dieb (Kartenwert 1) spielst hast du eine 50% Chance den Stich zu klauen, falls der Stich nicht schon durch Gambling/Democracy vergeben wird.",
};

export const CardsDescriptions: { [cardName: string]: string } = {
  Narr5: "Dreht die Legerichtung nach dieser Runde um.",
  Narr6:
    "Die Karte des nächsten Spielers in Legerichtung wird bei der Wertung ignoriert.",
  Narr7:
    "Der Gewinner des Stiches bleibt gleich, aber die Punkte werden nur allen anderen angerechnet.",
  Narr8:
    "Die Karte des vorherigen Spielers in Legerichtung wird bei der Wertung ignoriert.",

  Spezial14: "Regenbogen 14. Der Wert dieses Stiches wird auf 3 gesetzt.",
  "Spezial-1": "Regenbogen -1. Der Wert dieses Stiches wird auf -1 gesetzt.",
  Spezial69:
    "Regenbogen 69. Der Wert dieses Stiches wird auf -3 gesetzt, falls ein Drache enthalten ist.",
  Spezial7:
    "Die Auswahlmethode des Gewinners des Stiches wird auf eine Abstimmung gesetzt.",
  Spezial6:
    "Die Auswahlmethode des Gewinners des Stiches wird gleichverteilt zufällig gesetzt.",

  Spezial1:
    "Der Stich geht an niemanden (auch nicht Christian) und niemand bekommt Punkte.",
  "Spezial7.5":
    "Regenbogen 7 1/2. Nach dem Stich muss jeder eine Karte weitergeben, falls noch Karten da sind.",
  "Spezial9.75":
    "Regenbogen 9 3/4. Der Gewinner des Stiches muss die Ansage um 1 verändern.",
  Spezial2: "Verliert gegen alles, gewinnt aber gegen den Drachen.",
  Spezial3: "Gewinnt gegen alles, verliert aber gegen die Fee.",
};

export type WizardState = "lobby" | "game" | "finished";

export type OpenGamesData = { owner: string; id: number }[];

export type Card = {
  color: Color;
  value: number;
};

export enum Color {
  Red = "Rot",
  Green = "Grün",
  Blue = "Blau",
  Yellow = "Gelb",
  Wizard = "Zauberer",
  Fool = "Narr",
  Special = "Spezial",
  Nothing = "Nichts",
}
export function isRegularColor(color?: Color) {
  return (
    color == Color.Red ||
    color == Color.Yellow ||
    color == Color.Green ||
    color == Color.Blue
  );
}
export type CardType = "trump" | "layed" | "hand";
export type LayedCard = {
  card: Card;
  player: string;
};
export enum GamePhase {
  LOBBY,
  ROLE_SELECTION,
  RUNNING,
  FINISHED,
}
export enum StitchEvaluationMethod {
  NORMAL,
  RANDOM,
  POLL,
}
export type SelectChangeCard = "selectCard" | "waitForOthers" | "nothing";

export const AllCards: Card[] = (function () {
  const allCards: Card[] = [];
  for (const color of ["Rot", "Gelb", "Grün", "Blau"]) {
    for (let value = 1; value <= 13; value++) {
      allCards.push(<Card>{ color, value });
    }
  }
  for (let i = 1; i <= 4; i++) {
    allCards.push({ color: Color.Wizard, value: i });
  }
  for (let i = 1; i <= 8; i++) {
    allCards.push({ color: Color.Fool, value: i });
  }
  const specialCards = [1, 7.5, 9.75, -1, 14, 69, 1, 2, 3, 6, 7];
  for (const i of specialCards) {
    allCards.push({ color: Color.Special, value: i });
  }
  return allCards;
})();

export function convertCardToHref(card: Card): string {
  const c = card.color;
  if (c == "Nichts") return "/api/wizard/cardimages/empty.webp";
  const color =
    card.value == 7.5 ||
    card.value == 9.75 ||
    card.value == -1 ||
    card.value == 14 ||
    card.value == 69
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

export function isSameCard(a: Card | undefined, b: Card) {
  return isCard(a, b.color, b.value);
}

export function isCard(
  card: Card | undefined,
  color: Color,
  value: number,
): boolean {
  if (!card) return false;
  return card.color == color && card.value == value;
}

export interface SpecialRole {
  inGameName: string;
}
export interface ColorPreferenceSpecialRole extends SpecialRole {
  color: Color;
  chance: number;
}

export const FunctionalSpecialRoles = {
  BLASTER: { inGameName: "Der Sprengmeister" },
  HEADFOOL: { inGameName: "Der Obernarr" },
  SERVANT: { inGameName: "Der Knecht" },
  GLEEFUL: { inGameName: "Der Schadenfrohe" },
  PESSIMIST: { inGameName: "Der Pessimist" },
  OPTIMIST: { inGameName: "Der Optimist" },
  GAMBLER: { inGameName: "Der Gambler" },
  THIEF: { inGameName: "Der Dieb" },
  GREEDY: { inGameName: "Der Gierige" },
};
export const ColorPreferenceSpecialRoles = {
  WIZARDMASTER: {
    inGameName: "Der Zaubermeister",
    color: Color.Wizard,
    chance: 4,
  },
  REDSHEEP: { inGameName: "Das rote Schaf", color: Color.Red, chance: 2 },
  YELLOWSHEEP: {
    inGameName: "Das gelbe Schaf",
    color: Color.Yellow,
    chance: 2,
  },
  GREENSHEEP: { inGameName: "Das grüne Schaf", color: Color.Green, chance: 2 },
  BLUESHEEP: { inGameName: "Das blaue Schaf", color: Color.Blue, chance: 2 },
};
