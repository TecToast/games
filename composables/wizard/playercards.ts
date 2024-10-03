import { useWebsocketRef } from "~/utils/wsutils";
import type { Card } from "~/utils/wizard/types";
import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export function usePlayerCards(trump: Ref<Card>) {
  const { data } = useWizardConnection();
  const { result: playerCards } = useWebsocketRef<Card[]>(
    data,
    "Cards",
    "cards",
    [],
  );
  function removeCardFromDeck(card: Card) {
    const index = playerCards.value.findIndex(
      (c) => c.color == card.color && c.value == card.value,
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
