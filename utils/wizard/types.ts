export const Rules: { [rule: string]: string[] } = {
  Punkte: ["Normal", "Max. 30"],
  Zauberer: ["Normal", "Mittlerer Zauberer", "Letzter Zauberer"],
  Ansage: ["Nacheinander", "Blind"],
  Trumpf: ["Normal", "Nur Farben"],
  Spezialkarten: ["Aktiviert", "Deaktiviert"],
  Spezialrollen: ["Deaktiviert", "Freie Auswahl", "Vorgegeben", "Geheim"]
};

export const SpecialRolesDescriptions: {[role: string]:string} = {
  "Der Sprengmeister": "Du bekommst immer die Bombe, falls sie im Spiel ist",
  "Der Obernarr": "Du bekommst immer den ersten Narren im Stapel, bevor normal ausgeteilt wird",
  "Der Knecht": "Du bekommts immer so viele Knechte/Mägde wie möglich, bevor normal ausgeteilt wird",
  "Der Schadenfrohe": "Du bekommst 5 Punkte jedes mal wenn ein anderer Spieler Minuspunkte bekommt",
  "Der Pessimist": "Du bekommst 50 Punkte wenn du korrekt angesagt 0 Stiche machst, kannst dafür aber maximal 70 Punkte pro Runde machen",
  "Der Optimist": "Du bekommts 5 Punkte pro gemachtem Stich wenn du eins neben deiner Vorhersage liegts, dafür kein +20 bei max. 3 Stichen",
  "Der Zaubermeister": "Du hast jedes mal wenn ein anderer einen Zauberer ausgeteteilt bekommt eine 1/4 Chance ihn zu stehlen.",
  "Das rote Schaf": "Du hast jedes mal wenn ein anderer eine rote Karte ausgeteteilt bekommt eine 1/2 Chance sie zu stehlen.",
  "Das gelbe Schaf": "Du hast jedes mal wenn ein anderer eine gelbe Karte ausgeteteilt bekommt eine 1/2 Chance sie zu stehlen.",
  "Das grüne Schaf": "Du hast jedes mal wenn ein anderer eine grüne Karte ausgeteteilt bekommt eine 1/2 Chance sie zu stehlen.",
  "Das blaue Schaf": "Du hast jedes mal wenn ein anderer eine blaue Karte ausgeteteilt bekommt eine 1/2 Chance sie zu stehlen."
}

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
    c == "Grün"
      ? "Gruen"
      : c == "Zauberer"
        ? "Z"
        : c == "Narr"
          ? "N"
          : c == "Spezial"
            ? "S"
            : c;
  //TODO: für Spezialkarte Bombe, dh. Card(Color.Special, 1), muss richtige *.webp-Datei hinterlegt werden
  return `/api/wizard/cardimages/${color}_${card.value}.webp`;
}
export function isCard(card: Card, color: Color, value: number): boolean {
  return card.color == color && card.value == value;
}
