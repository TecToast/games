import {
  Card,
  GamePhase,
  SpecialRole,
  Rules,
  Rule,
  Color,
  FunctionalSpecialRoles,
  ColorPreferenceSpecialRole,
  isRegularColor,
  StitchEvaluationMethod,
} from "~/utils/wizard/types";
import * as pm from "./peermanager";
import { WSMessage } from "~/utils/wizard/messages";
import {
  NOTHINGCARD,
  BOMB,
  SEVENPOINTFIVE,
  NINEPOINTSEVENFIVE,
  FAIRY,
  DRAGON,
  DEEZNUTS,
  TROLL,
  STONKS,
  BLOCKED,
  REVERSE,
  DEMOCRACY,
  GAMBLING,
  EVERYBODYPOINTS,
  FLEXTAPE,
} from "~/utils/wizard/specialcards";
import { randomInt } from "crypto";

export class Game {
  constructor(
    private id: string,
    private owner: string,
  ) {
    Object.entries(Rules).forEach(([key, value]) => {
      this.rules.set(key as Rule, value[0]);
    });
    this.addPlayer(owner);
  }
  readonly stitchGoals = new Map<string, number>();
  readonly stitchDone: Map<string, number> = new Map();
  readonly points: Map<string, number> = new Map();
  readonly specialRoles: Map<SpecialRole, string> = new Map();
  readonly cards: Map<string, Card[]> = new Map();
  readonly layedCards: Map<string, Card> = new Map();
  readonly players: Set<string> = new Set();
  readonly playersRemainingForRoleSelection: string[] = [];
  readonly winnerVotingTally: Map<string, number> = new Map();
  roundPlayers: string[] = [];
  originalOrderForSubround: string[] = [];
  readonly rules: Map<Rule, string> = new Map();
  readonly cardsToChange: Map<string, Card> = new Map();

  playersRemainingForWinnerVoting: Set<string> = new Set();
  firstCard: Card | null = null;
  trump: Card = NOTHINGCARD;
  phase: GamePhase = GamePhase.LOBBY;
  currentPlayer: string = "";
  round: number = 0;
  isPredict: boolean = true;
  reversedPlayOrder: boolean = false;
  userToChangeStitchPrediction: string | null = null;
  isSevenPointFiveUsed: boolean = false;
  winner: string = "";
  stitchValue = 0;
  forcedCards: Card[] = [];

  allCards: Card[] = (() => {
    const cards: Card[] = [];
    const colors = [Color.Red, Color.Yellow, Color.Green, Color.Blue];

    for (const color of colors) {
      for (let value = 1; value <= 13; value++) {
        cards.push({ color, value });
      }
    }

    for (let i = 1; i <= 4; i++) {
      cards.push({ color: Color.Wizard, value: i });
      cards.push({ color: Color.Fool, value: i });
    }

    if (this.checkRule("Spezialkarten") === "Aktiviert") {
      cards.push(BOMB, SEVENPOINTFIVE, NINEPOINTSEVENFIVE, FAIRY, DRAGON);
    }

    if (this.checkRule("Memekarten") === "Aktiviert") {
      cards.push(
        DEEZNUTS,
        TROLL,
        STONKS,
        BLOCKED,
        REVERSE,
        DEMOCRACY,
        GAMBLING,
        EVERYBODYPOINTS,
        FLEXTAPE,
      );
    }

    return cards;
  })();

  private checkRule(rule: Rule) {
    return this.rules.get(rule) ?? Rules[rule][0];
  }

  broadcast(message: WSMessage) {
    for (const player of this.players) {
      pm.send(player, message);
    }
  }

  updateLobby() {
    this.broadcast({ type: "GameInfo", players: this.players });
  }

  addPlayer(name: string) {
    this.players.add(name);
    this.updateLobby();
    pm.send(name, { type: "RuleChange", rules: this.rules });
  }

  removePlayer(name: string) {
    if (this.players.delete(name)) this.updateLobby();
  }

  updateStitches(name: string) {
    this.broadcast({
      type: "StitchGoal",
      name,
      goal: this.stitchGoals.get(name)!,
    });
  }

  private generateOrder(
    beginningPlayerOffset: number,
    respectReversedOrder: boolean,
  ): string[] {
    const direction = respectReversedOrder && this.reversedPlayOrder ? -1 : 1;
    const list: string[] = new Array(this.players.size);
    const pl = Array.from(this.players);
    for (let i = 0; i < pl.length; i++) {
      list[i] =
        pl[(i * direction + beginningPlayerOffset + pl.length) % pl.length];
    }
    return list;
  }

  generateStitchOrder(): string[] {
    return this.generateOrder(this.round - 1, false);
  }

  generatePlayOrder(): string[] {
    return this.generateOrder(this.round, true);
  }

  generateNextPlayOrder(winnerIndex: number): string[] {
    return this.generateOrder(winnerIndex, true);
  }

  checkIfAllPredicted(name: string) {
    this.broadcast({ type: "HasPredicted", name });
    if (this.stitchGoals.size === this.players.size) {
      this.roundPlayers = [];
      this.players.forEach((player) => {
        this.updateStitches(player);
      });
      this.nextPlayer();
    } else {
      pm.send(name, { type: "AcceptedGoal" });
    }
  }

  endGame() {
    const sortedPlayers = Array.from(this.players).sort(
      (a, b) => this.points.get(b)! - this.points.get(a)!,
    );
    const playerPoints = sortedPlayers.map((player) => ({
      player: `${player}${
        this.checkRule("Spezialrollen") !== "Deaktiviert"
          ? ` - ${Array.from(this.specialRoles.entries())
              .filter(([_, value]) => value === player)
              .map(([key]) => key.inGameName)
              .join(", ")}`
          : ""
      }`,
      points: this.points.get(player)!,
    }));
    this.broadcast({ type: "EndGame", players: playerPoints });
  }

  async nextRound(nodelay: boolean) {
    await new Promise((resolve) => setTimeout(resolve, nodelay ? 0 : 1000));
    if (++this.round * this.players.size > this.allCards.length) {
      this.endGame();
      return;
    }
    this.giveCards(this.round);
    this.roundPlayers = this.generateStitchOrder();
    this.broadcast({
      type: "Round",
      round: this.round,
      firstCome: this.roundPlayers[1],
    });
    this.broadcast({ type: "IsPredict", isPredict: true });
    this.originalOrderForSubround = Array.from(this.roundPlayers);
    if (this.checkRule("Ansage") === "Nacheinander") {
      this.nextPlayer();
    } else {
      this.players.forEach((player) => {
        pm.send(player, { type: "CurrentPlayer", player });
      });
    }
  }

  private getShuffledCards(): Card[] {
    const cards = this.allCards.slice();
    for (let i = cards.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  giveCards(round: number) {
    const stack = this.getShuffledCards();
    this.players.forEach((player) => this.cards.set(player, []));
    this.forcedCards.forEach((card) => removeCard(stack, card));
    const mutableForced = this.forcedCards.slice();
    const headfool = this.specialRoles.get(FunctionalSpecialRoles.HEADFOOL);
    if (headfool) {
      const firstFoolIndex = stack.findIndex(
        (card) => card.color === Color.Fool,
      );
      const firstFool = stack[firstFoolIndex];
      stack.splice(firstFoolIndex, 1);
      this.cards.get(headfool)!.push(firstFool);
    }
    const servant = this.specialRoles.get(FunctionalSpecialRoles.SERVANT);
    if (servant) {
      const playerCards = this.cards.get(servant)!;
      for (const servantCard of stack.filter(
        (card) =>
          card.value === 2 &&
          card.color in [Color.Red, Color.Yellow, Color.Green, Color.Blue],
      )) {
        if (playerCards.length < round) {
          playerCards.push(servantCard);
          removeCard(stack, servantCard);
        } else {
          break;
        }
      }
    }

    let enoughCardsDealt = false;
    while (!enoughCardsDealt) {
      enoughCardsDealt = true;
      for (const player of this.players) {
        if (this.cards.get(player)!.length < this.round) {
          enoughCardsDealt = false;
          const nextCard =
            mutableForced.shift() ?? stack.shift() ?? NOTHINGCARD;

          let stolenBy: string | null = null;
          let replacedCard: Card | null = null;
          const specialRoleEntry = this.specialRoles
            .entries()
            .find(
              ([role]) =>
                (role as ColorPreferenceSpecialRole).color === nextCard.color,
            );

          if (
            specialRoleEntry &&
            randomInt(
              (specialRoleEntry[0] as ColorPreferenceSpecialRole).chance,
            ) === 0
          ) {
            const [role, rolePlayer] = specialRoleEntry;
            const rolePlayerCards = this.cards.get(rolePlayer)!;
            if (rolePlayerCards.length >= this.round) {
              replacedCard = rolePlayerCards[randomInt(rolePlayerCards.length)];
            }
            rolePlayerCards.push(nextCard);
            stolenBy = rolePlayer;
          }

          if (nextCard === BOMB) {
            const blaster = this.specialRoles.get(
              FunctionalSpecialRoles.BLASTER,
            );
            if (blaster) {
              const blasterCards = this.cards.get(blaster)!;
              if (blasterCards.length >= this.round) {
                replacedCard = blasterCards[randomInt(blasterCards.length)];
              }
              this.cards.get(blaster)!.push(nextCard);
              stolenBy = blaster;
            }
          }

          if (!stolenBy) {
            this.cards.get(player)!.push(nextCard);
          } else if (replacedCard) {
            removeCard(this.cards.get(stolenBy)!, replacedCard);
            this.cards.get(player)!.push(replacedCard);
          }
        }
      }
    }

    const shifted: Map<string, number> = new Map();
    this.trump = stack.shift() ?? NOTHINGCARD;

    const forbidden =
      this.checkRule("Trumpf") === "Nur Farben"
        ? [Color.Wizard, Color.Fool, Color.Special]
        : [];

    while (this.skipTrump(forbidden)) {
      shifted.set(this.trump.color, (shifted.get(this.trump.color) ?? 0) + 1);
      this.trump = stack.shift() || NOTHINGCARD;
    }

    this.broadcast({ type: "Trump", trump: this.trump, shifted });

    for (const player of this.players) {
      pm.send(player, {
        type: "Cards",
        cards: this.cards.get(player)!,
        newCard: NOTHINGCARD,
      });
    }
  }

  skipTrump(forbidden: Color[]) {
    if (this.trump === NOTHINGCARD) return false;
    if (forbidden.includes(this.trump.color)) return true;
    const presentColorPreferences: Color[] = [];
    this.specialRoles.forEach((value, role) => {
      const color = (role as ColorPreferenceSpecialRole).color;
      if (color && color !== Color.Wizard) {
        presentColorPreferences.push(color);
      }
    });

    return (
      presentColorPreferences.length > 0 &&
      !presentColorPreferences.includes(this.trump.color) &&
      randomInt(2) === 0
    );
  }

  normalPointCalculation(player: string): number {
    const done = this.stitchDone.get(player)!;
    const goal = this.stitchGoals.get(player)!;
    return done === goal ? 20 + done * 10 : -10 * Math.abs(done - goal);
  }

  predictedCorrectly(player: string): boolean {
    return this.stitchDone.get(player) === this.stitchGoals.get(player);
  }

  async afterSubRound(
    wasBombUsed: boolean,
    everybodyPointsUsed: boolean,
    stitchValue: number,
  ): Promise<void> {
    if (!wasBombUsed) {
      Array.from(this.players)
        .filter((player) => (player === this.winner) !== everybodyPointsUsed)
        .forEach((player) => {
          this.addStitchDone(player, stitchValue);
          this.broadcast({
            type: "UpdateDoneStitches",
            player,
            amount: this.stitchDone.get(player)!,
          });
        });
    }

    const layedCards = Array.from(this.layedCards.values());
    const wasNinePointsSevenFiveUsed = layedCards.some(
      (card) => card.value === 9.75,
    );
    this.isSevenPointFiveUsed = layedCards.some((card) => card.value === 7.5);

    if (wasNinePointsSevenFiveUsed) {
      this.userToChangeStitchPrediction = this.winner;
    }

    this.layedCards.clear();
    this.firstCard = null;
    this.broadcast({
      type: "Winner",
      winner: wasBombUsed ? null : this.winner,
    });
    await new Promise((resolve) => setTimeout(resolve, 3300));
    this.broadcast({ type: "ClearForNewSubRound" });

    if (wasNinePointsSevenFiveUsed && !wasBombUsed) {
      pm.send(this.winner, { type: "ShowChangeStitchModal", show: true });
    } else {
      if (
        this.isSevenPointFiveUsed &&
        this.cards.get(this.winner)!.length > 0
      ) {
        this.broadcast({ type: "SevenPointFiveUsed" });
        return;
      }
      this.newSubround();
    }
  }

  newSubround() {
    this.cardsToChange.clear();
    if (this.cards.get(this.currentPlayer)!.length === 0) {
      let numberOfLoosingPlayers = 0;
      const results: Map<string, number> = new Map();

      this.players.forEach((player) => {
        const done = this.stitchDone.get(player)!;
        const goal = this.stitchGoals.get(player)!;
        const difference = Math.abs(goal - done);
        let amount: number;

        switch (player) {
          case this.specialRoles.get(FunctionalSpecialRoles.GAMBLER):
            amount = this.predictedCorrectly(player)
              ? done * 20
              : -20 * difference;
            break;
          case this.specialRoles.get(FunctionalSpecialRoles.PESSIMIST):
            amount =
              this.predictedCorrectly(player) && done === 0
                ? 50
                : Math.min(
                    this.normalPointCalculation(player),
                    20 + 10 * (12 / this.players.size),
                  );
            break;
          case this.specialRoles.get(FunctionalSpecialRoles.OPTIMIST):
            amount = this.predictedCorrectly(player)
              ? done * 10 + (done < 12 / this.players.size ? 0 : 20)
              : difference === 1
                ? 5 * done
                : -10 * difference;
            break;
          case this.specialRoles.get(FunctionalSpecialRoles.GREEDY):
            amount = done >= goal ? 5 * (goal + done) : -10 * difference;
            break;
          default:
            amount = this.normalPointCalculation(player);
        }

        if (
          amount < 0 &&
          this.specialRoles.get(FunctionalSpecialRoles.GLEEFUL) !== player
        ) {
          numberOfLoosingPlayers += 1;
        }
        results.set(player, amount);
      });

      const gleeful = this.specialRoles.get(FunctionalSpecialRoles.GLEEFUL);
      if (gleeful) {
        results.set(
          gleeful,
          (results.get(gleeful) || 0) + numberOfLoosingPlayers * 5,
        );
      }

      for (const [player, amount] of results.entries()) {
        if (this.checkRule("Punkte") === "Max. 30") {
          results.set(player, Math.min(amount, 30));
        }
        this.addPoints(player, results.get(player)!);
      }

      this.stitchGoals.clear();
      this.stitchDone.clear();
      this.isPredict = true;

      if (this.checkRule("Spezialrollen") !== "Geheim") {
        this.broadcast({
          type: "Results",
          results,
        });
      } else {
        for (const player of this.players) {
          pm.send(player, {
            type: "Results",
            results: new Map([[player, results.get(player)!]]),
          });
        }
      }

      this.nextRound(false);
    } else {
      this.roundPlayers = this.generateNextPlayOrder(
        Array.from(this.players).indexOf(this.winner),
      );
      this.originalOrderForSubround = this.roundPlayers.slice();
      this.currentPlayer = this.roundPlayers.shift()!;
      this.broadcast({ type: "CurrentPlayer", player: this.currentPlayer });
    }
  }

  private addStitchDone(player: string, amount: number): void {
    this.stitchDone.set(player, (this.stitchDone.get(player) || 0) + amount);
  }

  private addPoints(player: string, amount: number): void {
    this.points.set(player, (this.points.get(player) || 0) + amount);
  }

  filterBlockedPlayers(): void {
    this.originalOrderForSubround.forEach((playerToCheck, index) => {
      if (this.layedCards.get(playerToCheck) === BLOCKED) {
        const nextPlayer =
          this.originalOrderForSubround[(index + 1) % this.players.size];
        this.layedCards.delete(nextPlayer);
      }
      if (this.layedCards.get(playerToCheck) === FLEXTAPE) {
        const previousPlayer =
          this.originalOrderForSubround[
            (index - 1 + this.players.size) % this.players.size
          ];
        this.layedCards.delete(previousPlayer);
      }
    });
  }

  findStitchWinnerNormally(): void {
    const thiefPlayer = this.specialRoles.get(FunctionalSpecialRoles.THIEF);
    const layedCardsEntries = Array.from(this.layedCards.entries());
    const layedCardsValues = Array.from(this.layedCards.values());
    const dragonIngame = layedCardsValues.includes(DRAGON);
    const firstPlayerOfRound = this.originalOrderForSubround.find((player) =>
      this.layedCards.has(player),
    )!;
    const owner = (fn: (card: Card) => boolean) => {
      return layedCardsEntries.find(([_, card]) => fn(card))![0];
    };

    this.winner = (() => {
      if (
        thiefPlayer &&
        this.layedCards.get(thiefPlayer)?.value === 1 &&
        isRegularColor(this.layedCards.get(thiefPlayer)?.color) &&
        randomInt(2) === 0
      ) {
        return thiefPlayer;
      }

      if (layedCardsValues.includes(FAIRY) && dragonIngame) {
        return owner((card) => card === FAIRY);
      }

      if (dragonIngame) {
        return owner((card) => card === DRAGON);
      }

      if (
        Array.from(this.layedCards.entries()).every(
          ([_, card]) => card.color === Color.Fool || card === FAIRY,
        )
      ) {
        return owner((card) => card === FAIRY);
      }

      if (layedCardsValues.some((card) => card.color === Color.Wizard)) {
        if (this.checkRule("Zauberer") === "Letzter Zauberer") {
          return layedCardsEntries
            .reverse()
            .find(([_, card]) => card.color === Color.Wizard)![0];
        } else if (this.checkRule("Zauberer") === "Mittlerer Zauberer") {
          const wizards = layedCardsEntries.filter(
            ([_, card]) => card.color === Color.Wizard,
          );
          const winningWizardIndex = Math.floor((wizards.length - 1) / 2);
          return wizards[winningWizardIndex][0];
        } else {
          return owner((card) => card.color === Color.Wizard);
        }
      }

      let highest = [
        this.layedCards.get(firstPlayerOfRound)!,
        firstPlayerOfRound,
      ] as [Card, string];
      for (let i = 1; i < this.players.size; i++) {
        const playerToCheck = this.originalOrderForSubround[i];
        if (!this.layedCards.has(playerToCheck)) continue;

        const card = this.layedCards.get(playerToCheck)!;
        if (this.isHigherThan(card, highest[0])) {
          highest = [card, playerToCheck];
        }
      }
      return highest[1];
    })();
  }

  isHigherThan(newCard: Card, highestCard: Card) {
    if (newCard === FAIRY) return false;
    if (newCard === DRAGON) return true;
    if (highestCard == FAIRY) return true;
    if (newCard.color === Color.Fool) return false;
    if (highestCard === BOMB) return true;
    if (highestCard.color == Color.Fool) return true;
    if (
      newCard.color !== highestCard.color &&
      newCard.color !== this.trump.color
    )
      return false;
    if (newCard.color === highestCard.color)
      return newCard.value > highestCard.value;
    return true;
  }

  checkForReverseCard(): void {
    if (Array.from(this.layedCards.values()).includes(REVERSE)) {
      this.reversedPlayOrder = !this.reversedPlayOrder;
    }
  }

  findStitchEvaluationMethodAndValue(): StitchEvaluationMethod {
    const dragonIngame = Array.from(this.layedCards.values()).includes(DRAGON);
    this.stitchValue = 1;
    let stitchEvaluationMethod = StitchEvaluationMethod.NORMAL;

    this.originalOrderForSubround
      .map((player) => this.layedCards.get(player))
      .forEach((card) => {
        if (!card) return;
        if (card.value === -1)
          this.stitchValue = -1; // Troll card
        else if (card.value === 14)
          this.stitchValue = 3; // Stonks card
        else if (card.value === 69 && dragonIngame) this.stitchValue = -3; // Dragon deez nuts combination

        if (card === GAMBLING)
          stitchEvaluationMethod = StitchEvaluationMethod.RANDOM;
        else if (card === DEMOCRACY)
          stitchEvaluationMethod = StitchEvaluationMethod.POLL;
      });

    return stitchEvaluationMethod;
  }

  evaluateStitch(): boolean {
    this.filterBlockedPlayers();
    this.checkForReverseCard();
    const method = this.findStitchEvaluationMethodAndValue();
    if (method === StitchEvaluationMethod.POLL) return true;
    else if (method === StitchEvaluationMethod.RANDOM)
      this.winner = Array.from(this.players)[randomInt(this.players.size)];
    else this.findStitchWinnerNormally();

    return false;
  }

  nextPlayer() {
    const newCurrentPlayer =
      this.roundPlayers.shift() ||
      (() => {
        if (this.isPredict) {
          this.roundPlayers = this.generatePlayOrder();
          this.originalOrderForSubround = this.roundPlayers.slice();
          this.isPredict = false;
          this.broadcast({ type: "IsPredict", isPredict: false });
          this.nextPlayer();
          return;
        }
        const pollNecessary = this.evaluateStitch();
        const layedCardsValues = Array.from(this.layedCards.values());
        const bombUsed = layedCardsValues.includes(BOMB);
        const everybodyPointsUsed = layedCardsValues.includes(EVERYBODYPOINTS);

        if (pollNecessary && !bombUsed) {
          // Wait for poll results
          this.broadcast({ type: "ShowWinnerPollModal", show: true });
          this.playersRemainingForWinnerVoting = new Set(this.players);
          this.players.forEach((player) =>
            this.winnerVotingTally.set(player, 0),
          );
        } else {
          this.afterSubRound(bombUsed, everybodyPointsUsed, this.stitchValue);
        }
        return null;
      })();

    if (newCurrentPlayer) {
      this.currentPlayer = newCurrentPlayer;
      this.broadcast({ type: "CurrentPlayer", player: this.currentPlayer });
    }
  }
}

function removeCard(cards: Card[], card: Card) {
  const index = indexOfCard(cards, card);
  if (index !== -1) cards.splice(index, 1);
}

function indexOfCard(cards: Card[], card: Card): number {
  return cards.findIndex(
    (c) => c.color === card.color && c.value === card.value,
  );
}
