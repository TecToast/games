import { useWizardRef } from "~/utils/wsutils";
import type { Card } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function usePlayerCards(trump: Ref<Card>) {
  const { data } = useWizardConnection();
  const { result: playerCards } = useWizardRef(data, "Cards", []);

  function removeCardFromDeck(card: Card) {
    const index = playerCards.value.findIndex(
      (c) =>
        (c.color == card.color && c.value == card.value) ||
        (card.value == 7.5 && c.value == 7.5) ||
        (card.value == 9.75 && c.value == 9.75) ||
        (card.value == -1 && c.value == -1) ||
        (card.value == 14 && c.value == 14) ||
        (card.value == 69 && c.value == 69),
    );
    if (index != -1) playerCards.value.splice(index, 1);
  }

  return {
    playerCards: computed(() => {
      return sortCards(playerCards.value, trump.value);
    }),
    removeCardFromDeck,
  };
}

function sortCards(cards: Card[], trump: Card): Card[] {
  const n: Card[] = [];
  cards.filter((c) => c.color == "Spezial").forEach((c) => n.push(c));
  cards = cards.filter((c) => c.color != "Spezial");
  cards.filter((c) => c.color == "Zauberer").forEach((c) => n.push(c));
  cards = cards.filter((c) => c.color != "Zauberer");
  cards.filter((c) => c.color == "Narr").forEach((c) => n.push(c));
  cards = cards.filter((c) => c.color != "Narr");
  cards
    .filter((c) => c.color == trump.color)
    .sort((c1: Card, c2: Card) => {
      return c1.value < c2.value ? 1 : -1;
    })
    .forEach((c) => n.push(c));
  cards = cards.filter((c) => c.color != trump.color);
  ["Rot", "Gelb", "Grün", "Blau"].forEach((co) => {
    cards
      .filter((c) => c.color == co)
      .sort((c1: Card, c2: Card) => {
        return c1.value < c2.value ? 1 : -1;
      })
      .forEach((c) => n.push(c));
    cards = cards.filter((c) => c.color != co);
  });
  return n;
}
