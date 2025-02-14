import {
  type Card,
  GamePhase,
  type SpecialRole,
  Rules,
  type Rule,
  Color,
  FunctionalSpecialRoles,
  type ColorPreferenceSpecialRole,
  isRegularColor,
  StitchEvaluationMethod,
  ColorPreferenceSpecialRoles,
  isSameCard,
} from "~/utils/wizard/types";
import pm from "./peermanager";
import { type LayCard, type WSMessage } from "~/utils/wizard/messages";
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
  rainbowCards,
} from "~/utils/wizard/specialcards";
import { randomInt } from "crypto";
import { GameManager } from "./gamemanger";

export class Game {
  constructor(
    public id: number,
    public owner: string,
  ) {
    Object.entries(Rules).forEach(([key, value]) => {
      this.rules[key] = value[0];
    });
    this.addPlayer(owner);
  }
  stitchGoals: { [k: string]: number } = {};
  stitchDone: { [k: string]: number } = {};
  readonly points: { [k: string]: number } = {};
  readonly specialRoles: { [k: string]: string } = {};
  readonly cards: { [k: string]: Card[] } = {};
  readonly winnerVotingTally: { [k: string]: number } = {};
  readonly rules: { [k: string]: string } = {};
  roundPlayers: string[] = [];
  originalOrderForSubround: string[] = [];
  cardsToChange: { [k: string]: Card } = {};

  players: string[] = [];
  playersRemainingForWinnerVoting: string[] = [];
  playersRemainingForRoleSelection: string[] = [];
  layedCards: { [k: string]: Card } = {};
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
    return this.rules[rule] ?? Rules[rule][0];
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
    if (!this.players.includes(name)) {
      this.players.push(name);
    }
    this.updateLobby();
    pm.send(name, { type: "RuleChange", rules: this.rules });
  }

  removePlayer(name: string) {
    if (removeFromArray(this.players, name)) this.updateLobby();
  }

  updateStitches(name: string) {
    this.broadcast({
      type: "StitchGoalOf",
      name,
      goal: this.stitchGoals[name],
    });
  }

  private generateOrder(
    beginningPlayerOffset: number,
    respectReversedOrder: boolean,
  ): string[] {
    const direction = respectReversedOrder && this.reversedPlayOrder ? -1 : 1;
    const list: string[] = new Array(this.players.length);
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
    if (Object.keys(this.stitchGoals).length === this.players.length) {
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
      (a, b) => this.points[b] - this.points[a],
    );
    const playerPoints = sortedPlayers.map((player) => ({
      player: `${player}${
        this.checkRule("Spezialrollen") !== "Deaktiviert"
          ? ` - ${
              Object.entries(this.specialRoles).filter(
                ([_, value]) => value === player,
              )[0][0]
            }`
          : ""
      }`,
      points: this.points[player],
    }));
    this.broadcast({ type: "EndGame", players: playerPoints });
    GameManager.removeGame(this.id, false);
  }

  async nextRound(nodelay: boolean) {
    await new Promise((resolve) => setTimeout(resolve, nodelay ? 0 : 1000));
    if (++this.round * this.players.length > this.allCards.length) {
      this.endGame();
      return;
    }
    this.giveCards(this.round);
    this.roundPlayers = this.generateStitchOrder();
    this.broadcast({
      type: "Round",
      round: this.round,
    });
    this.broadcast({
      type: "FirstCome",
      player: this.roundPlayers[1],
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

  giveCards(round: number) {
    const stack = getShuffled(this.allCards);
    this.players.forEach((player) => (this.cards[player] = []));
    this.forcedCards.forEach((card) => removeCard(stack, card));
    const mutableForced = this.forcedCards.slice();
    const headfool = this.specialRoles["Der Obernarr"];
    if (headfool) {
      const firstFool = removeCard(stack, (c) => c.color === Color.Fool)!;
      this.cards[headfool].push(firstFool);
    }
    const servant = this.specialRoles["Der Knecht"];
    if (servant) {
      const playerCards = this.cards[servant];
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
        if (this.cards[player].length < this.round) {
          enoughCardsDealt = false;
          const nextCard =
            mutableForced.shift() ?? stack.shift() ?? NOTHINGCARD;
          let stolenBy: string | null = null;
          let replacedCard: Card | null = null;
          const specialRoleEntry = Object.entries(this.specialRoles).find(
            ([role]) =>
              (
                this.getSpecialRoleFromInGameName(
                  role,
                ) as ColorPreferenceSpecialRole
              ).color === nextCard.color,
          );

          if (
            specialRoleEntry &&
            randomInt(
              (
                this.getSpecialRoleFromInGameName(
                  specialRoleEntry[0],
                ) as ColorPreferenceSpecialRole
              ).chance,
            ) === 0
          ) {
            const [role, rolePlayer] = specialRoleEntry;
            const rolePlayerCards = this.cards[rolePlayer];
            if (rolePlayerCards.length >= this.round) {
              replacedCard = rolePlayerCards[randomInt(rolePlayerCards.length)];
            }
            rolePlayerCards.push(nextCard);
            stolenBy = rolePlayer;
          }

          if (isSameCard(nextCard, BOMB)) {
            const blaster = this.specialRoles["Der Sprengmeister"];
            if (blaster) {
              const blasterCards = this.cards[blaster];
              if (blasterCards.length >= this.round) {
                replacedCard = blasterCards[randomInt(blasterCards.length)];
              }
              this.cards[blaster].push(nextCard);
              stolenBy = blaster;
            }
          }

          if (!stolenBy) {
            this.cards[player].push(nextCard);
          } else if (replacedCard) {
            removeCard(this.cards[stolenBy], replacedCard);
            this.cards[player].push(replacedCard);
          }
        }
      }
    }

    const shifted: { [k: string]: number } = {};
    this.trump = stack.shift() ?? NOTHINGCARD;

    const forbidden =
      this.checkRule("Trumpf") === "Nur Farben"
        ? [Color.Wizard, Color.Fool, Color.Special]
        : [];

    while (this.skipTrump(forbidden)) {
      shifted[this.trump.color] = (shifted[this.trump.color] ?? 0) + 1;
      this.trump = stack.shift() || NOTHINGCARD;
    }

    this.broadcast({ type: "Trump", trump: this.trump });
    this.broadcast({ type: "TrumpShifted", shifted });

    for (const player of this.players) {
      pm.send(player, {
        type: "Cards",
        cards: this.cards[player],
      });
    }
  }

  skipTrump(forbidden: Color[]) {
    if (isSameCard(this.trump, NOTHINGCARD)) return false;
    if (forbidden.includes(this.trump.color)) return true;
    const presentColorPreferences: Color[] = [];
    Object.keys(this.specialRoles).forEach((role) => {
      const color = (
        this.getSpecialRoleFromInGameName(role) as ColorPreferenceSpecialRole
      ).color;
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
    const done = this.stitchDone[player];
    const goal = this.stitchGoals[player];
    return done === goal ? 20 + done * 10 : -10 * Math.abs(done - goal);
  }

  predictedCorrectly(player: string): boolean {
    return this.stitchDone[player] === this.stitchGoals[player];
  }

  async afterSubRound(
    wasBombUsed: boolean,
    everybodyPointsUsed: boolean,
    stitchValue: number,
  ) {
    if (!wasBombUsed) {
      Array.from(this.players)
        .filter((player) => (player === this.winner) !== everybodyPointsUsed)
        .forEach((player) => {
          this.addStitchDone(player, stitchValue);
          this.broadcast({
            type: "UpdateDoneStitches",
            player,
            amount: this.stitchDone[player],
          });
        });
    }

    const layedCards = Object.values(this.layedCards);
    const wasNinePointsSevenFiveUsed = layedCards.some(
      (card) => card.value === 9.75,
    );
    this.isSevenPointFiveUsed = layedCards.some((card) => card.value === 7.5);

    if (wasNinePointsSevenFiveUsed) {
      this.userToChangeStitchPrediction = this.winner;
    }

    this.layedCards = {};
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
      if (this.isSevenPointFiveUsed && this.cards[this.winner].length > 0) {
        this.broadcast({ type: "SevenPointFiveUsed" });
        return;
      }
      this.newSubround();
    }
  }

  newSubround() {
    this.cardsToChange = {};
    if (this.cards[this.currentPlayer].length === 0) {
      let numberOfLoosingPlayers = 0;
      const results: { [k: string]: number } = {};

      this.players.forEach((player) => {
        const done = this.stitchDone[player];
        const goal = this.stitchGoals[player];
        const difference = Math.abs(goal - done);
        let amount: number;

        switch (player) {
          case this.specialRoles["Der Gambler"]:
            amount = this.predictedCorrectly(player)
              ? done * 20
              : -20 * difference;
            break;
          case this.specialRoles["Der Pessimist"]:
            amount =
              this.predictedCorrectly(player) && done === 0
                ? 50
                : Math.min(
                    this.normalPointCalculation(player),
                    20 + 10 * (12 / this.players.length),
                  );
            break;
          case this.specialRoles["Der Optimist"]:
            amount = this.predictedCorrectly(player)
              ? done * 10 + (done < 12 / this.players.length ? 0 : 20)
              : difference === 1
                ? 5 * done
                : -10 * difference;
            break;
          case this.specialRoles["Der Gierige"]:
            amount = done >= goal ? 5 * (goal + done) : -10 * difference;
            break;
          default:
            amount = this.normalPointCalculation(player);
        }

        if (amount < 0 && this.specialRoles["Der Schadenfrohe"] !== player) {
          numberOfLoosingPlayers += 1;
        }
        results[player] = amount;
      });

      const gleeful = this.specialRoles["Der Schadenfrohe"];
      if (gleeful) {
        results[gleeful] = (results[gleeful] || 0) + numberOfLoosingPlayers * 5;
      }

      for (const [player, amount] of Object.entries(results)) {
        if (this.checkRule("Punkte") === "Max. 30") {
          results[player] = Math.min(amount, 30);
        }
        this.addPoints(player, results[player]);
      }

      this.stitchGoals = {};
      this.stitchDone = {};
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
            results: { [player]: results[player] },
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
    this.stitchDone[player] = (this.stitchDone[player] || 0) + amount;
  }

  private addPoints(player: string, amount: number): void {
    this.points[player] = (this.points[player] || 0) + amount;
  }

  filterBlockedPlayers(): void {
    this.originalOrderForSubround.forEach((playerToCheck, index) => {
      if (isSameCard(this.layedCards[playerToCheck], BLOCKED)) {
        const nextPlayer =
          this.originalOrderForSubround[(index + 1) % this.players.length];
        delete this.layedCards[nextPlayer];
      }
      if (isSameCard(this.layedCards[playerToCheck], FLEXTAPE)) {
        const previousPlayer =
          this.originalOrderForSubround[
            (index - 1 + this.players.length) % this.players.length
          ];
        delete this.layedCards[previousPlayer];
      }
    });
  }

  findStitchWinnerNormally(): void {
    const thiefPlayer = this.specialRoles["Der Dieb"];
    const layedCardsEntries = Object.entries(this.layedCards);
    const layedCardsValues = Object.values(this.layedCards);
    const dragonIngame = containsCard(layedCardsValues, DRAGON);
    const firstPlayerOfRound = this.originalOrderForSubround.find(
      (player) => player in this.layedCards,
    )!;
    const owner = (param: Card | ((card: Card) => boolean)) => {
      const fn =
        typeof param === "function"
          ? param
          : (card: Card) => isSameCard(card, param);
      return layedCardsEntries.find(([_, card]) => fn(card))![0];
    };

    this.winner = (() => {
      if (
        thiefPlayer &&
        this.layedCards[thiefPlayer]?.value === 1 &&
        isRegularColor(this.layedCards[thiefPlayer]?.color) &&
        randomInt(2) === 0
      ) {
        return thiefPlayer;
      }

      if (containsCard(layedCardsValues, FAIRY) && dragonIngame) {
        return owner(FAIRY);
      }

      if (dragonIngame) {
        return owner(DRAGON);
      }

      if (
        layedCardsEntries.every(
          ([_, card]) => card.color === Color.Fool || isSameCard(card, FAIRY),
        )
      ) {
        return owner((c) => c.color === Color.Fool);
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
        this.layedCards[firstPlayerOfRound],
        firstPlayerOfRound,
      ] as [Card, string];
      for (let i = 1; i < this.players.length; i++) {
        const playerToCheck = this.originalOrderForSubround[i];
        if (!(playerToCheck in this.layedCards)) continue;

        const card = this.layedCards[playerToCheck];
        if (this.isHigherThan(card, highest[0])) {
          highest = [card, playerToCheck];
        }
      }
      return highest[1];
    })();
  }

  isHigherThan(newCard: Card, highestCard: Card) {
    if (isSameCard(newCard, FAIRY)) return false;
    if (isSameCard(newCard, DRAGON)) return true;
    if (isSameCard(highestCard, FAIRY)) return true;
    if (newCard.color === Color.Fool) return false;
    if (isSameCard(highestCard, BOMB)) return true;
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
    if (containsCard(Object.values(this.layedCards), REVERSE)) {
      this.reversedPlayOrder = !this.reversedPlayOrder;
    }
  }

  findStitchEvaluationMethodAndValue(): StitchEvaluationMethod {
    const dragonIngame = containsCard(Object.values(this.layedCards), DRAGON);
    this.stitchValue = 1;
    let stitchEvaluationMethod = StitchEvaluationMethod.NORMAL;

    this.originalOrderForSubround
      .map((player) => this.layedCards[player])
      .forEach((card) => {
        if (!card) return;
        if (card.value === -1)
          this.stitchValue = -1; // Troll card
        else if (card.value === 14)
          this.stitchValue = 3; // Stonks card
        else if (card.value === 69 && dragonIngame) this.stitchValue = -3; // Dragon deez nuts combination

        if (isSameCard(card, GAMBLING))
          stitchEvaluationMethod = StitchEvaluationMethod.RANDOM;
        else if (isSameCard(card, DEMOCRACY))
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
      this.winner = this.players[randomInt(this.players.length)];
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
        const layedCardsValues = Object.values(this.layedCards);
        const bombUsed = containsCard(layedCardsValues, BOMB);
        const everybodyPointsUsed = containsCard(
          layedCardsValues,
          EVERYBODYPOINTS,
        );

        if (pollNecessary && !bombUsed) {
          // Wait for poll results
          this.broadcast({ type: "ShowWinnerPollModal", show: true });
          this.playersRemainingForWinnerVoting = this.players.slice();
          this.players.forEach(
            (player) => (this.winnerVotingTally[player] = 0),
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

  changeRule(rule: Rule, value: string) {
    this.rules[rule] = value;
    this.broadcast({ type: "RuleChange", rules: this.rules });
  }

  layCard(name: string, layCard: LayCard) {
    if (name !== this.currentPlayer || this.isPredict) return;
    const playerCards = this.cards[name];
    const { card: realCard, selectedColor } = layCard;
    if (!containsCard(playerCards, realCard)) return;
    const card =
      selectedColor &&
      isRegularColor(selectedColor) &&
      containsCard(rainbowCards, realCard)
        ? { ...realCard, color: selectedColor }
        : realCard;

    if (this.firstCard) {
      const fc = this.firstCard;
      if (
        ![Color.Fool, Color.Wizard, Color.Special].includes(realCard.color) &&
        fc.color !== card.color &&
        fc.color !== Color.Wizard &&
        !isSameCard(fc, DRAGON) &&
        playerCards.some((c) => c.color === fc.color)
      ) {
        return;
      }
    }

    if (
      Object.values(this.layedCards).every(
        (c) =>
          !isSameCard(c, DRAGON) &&
          [Color.Fool, Color.Special].includes(c.color),
      )
    ) {
      if (
        isSameCard(card, DRAGON) ||
        ![Color.Special, Color.Fool].includes(card.color)
      ) {
        this.firstCard = card;
      }
    }

    this.layedCards[name] = card;
    removeCard(playerCards, realCard);
    this.broadcast({ type: "PlayerCard", card: { card, player: name } });
    this.nextPlayer();
  }

  async broadcastRoleChoices() {
    if (this.checkRule("Spezialrollen") === "Geheim") {
      for (const player of this.players) {
        pm.send(player, {
          type: "SelectedRoles",
          roles: Object.fromEntries(
            Object.entries(this.specialRoles).map(([role, p]) => [
              p,
              p === player ? role : "???",
            ]),
          ),
        });
      }
    } else {
      this.broadcast({
        type: "SelectedRoles",
        roles: Object.fromEntries(
          Object.entries(this.specialRoles).map(([role, p]) => [p, role]),
        ),
      });
    }
  }

  allowNextPlayerToPickRole() {
    const nextPlayer = this.playersRemainingForRoleSelection[0];
    this.broadcastRoleChoices();
    this.broadcast({
      type: "CurrentRoleSelectingPlayer",
      currentPlayer: nextPlayer,
    });
  }

  getSpecialRoleFromInGameName(inGameName: string): SpecialRole | undefined {
    const result = [
      ...Object.entries(FunctionalSpecialRoles),
      ...Object.entries(ColorPreferenceSpecialRoles),
    ].find(([_, role]) => role.inGameName === inGameName);
    return result ? result[1] : undefined;
  }

  start() {
    if (![GamePhase.LOBBY, GamePhase.ROLE_SELECTION].includes(this.phase))
      return;
    this.players = getShuffled(this.players);
    this.players.forEach((player) => (this.points[player] = 0));
    this.phase = GamePhase.RUNNING;
    this.broadcast({ type: "GameStarted", players: this.players });
    this.broadcastRoleChoices();
    this.nextRound(true);
  }

  sendCurrentState(u: string) {
    pm.send(u, {
      type: "Cards",
      cards: this.cards[u],
    });
    pm.send(u, { type: "Trump", trump: this.trump });
    pm.send(u, {
      type: "Round",
      round: this.round,
    });
    if (!this.stitchGoals[u]) {
      pm.send(u, {
        type: "FirstCome",
        player: this.originalOrderForSubround[1],
      });
    }
    pm.send(u, { type: "IsPredict", isPredict: this.isPredict });
    Object.entries(this.stitchDone).forEach(([player, amount]) => {
      pm.send(u, {
        type: "UpdateDoneStitches",
        player,
        amount,
      });
    });
    pm.send(u, { type: "GameStarted", players: this.players });
    Object.entries(this.layedCards).forEach(([player, card]) => {
      pm.send(u, {
        type: "PlayerCard",
        card: { card, player },
      });
    });
    const isBlind = this.checkRule("Ansage") === "Blind";
    const isSecretRole = this.checkRule("Spezialrollen") === "Geheim";
    pm.send(u, {
      type: "SelectedRoles",
      roles: Object.fromEntries(
        Object.entries(this.specialRoles).map(([role, p]) => [
          p,
          !isSecretRole || p === u ? role : "???",
        ]),
      ),
    });
    if (isBlind && this.isPredict) {
      Object.keys(this.stitchGoals).forEach((player) => {
        pm.send(u, {
          type: "HasPredicted",
          name: player,
        });
      });
      pm.send(u, { type: "CurrentPlayer", player: u });
    } else {
      Object.entries(this.stitchGoals).forEach(([player, goal]) => {
        pm.send(u, {
          type: "StitchGoalOf",
          name: player,
          goal,
        });
      });
      pm.send(u, { type: "CurrentPlayer", player: this.currentPlayer });
    }
  }

  async handleMessage(msg: WSMessage, username: string) {
    switch (msg.type) {
      case "StartButtonClicked":
        if (this.phase === GamePhase.LOBBY && username === this.owner) {
          const selectedRule = this.checkRule("Spezialrollen");
          if (selectedRule === "Freie Auswahl") {
            this.phase = GamePhase.ROLE_SELECTION;
            this.playersRemainingForRoleSelection = getShuffled(this.players);
            this.allowNextPlayerToPickRole();
          } else if (["Vorgegeben", "Geheim"].includes(selectedRule)) {
            const allRoles = getShuffled(
              Object.values(FunctionalSpecialRoles)
                .concat(Object.values(ColorPreferenceSpecialRoles))
                .map((role) => role.inGameName),
            );
            this.players.forEach((player) => {
              this.specialRoles[allRoles.shift()!] = player;
            });
            this.start();
          } else {
            this.start();
          }
        }
        break;
      case "RequestSelectedRole":
        if (username == this.playersRemainingForRoleSelection[0]) {
          const requestedRole = this.getSpecialRoleFromInGameName(msg.roleName);
          if (requestedRole && !(msg.roleName in this.specialRoles)) {
            this.specialRoles[msg.roleName] = username;
            this.playersRemainingForRoleSelection.shift();
            if (this.playersRemainingForRoleSelection.length === 0) {
              this.broadcast({
                type: "CurrentRoleSelectingPlayer",
                currentPlayer: "",
              });
              this.start();
            } else {
              this.allowNextPlayerToPickRole();
            }
          }
        }
        break;
      case "LeaveGame":
        // TODO: Check which phase and probably change owner etc (or delete the game)
        // TODO: if all users left: delete room
        switch (this.phase) {
          case GamePhase.LOBBY:
            if (username == this.owner) {
              GameManager.removeGame(this.id);
            }
            this.removePlayer(username);
            pm.send(username, { type: "RedirectHome" });
            break;
          case GamePhase.RUNNING:
          case GamePhase.ROLE_SELECTION:
            this.endGame();
            this.phase = GamePhase.FINISHED;
            break;
          case GamePhase.FINISHED:
            pm.send(username, { type: "RedirectHome" });
            break;
        }
        break;
      case "StitchGoal":
        if (!this.isPredict) return;
        const defaultPrediction = this.checkRule("Ansage") === "Nacheinander";
        if (defaultPrediction && username !== this.currentPlayer) return;
        if (msg.goal < 0 || msg.goal > this.round + 3) return;
        this.stitchGoals[username] = msg.goal;
        this.stitchDone[username] = 0;
        if (defaultPrediction) {
          this.updateStitches(username);
          this.nextPlayer();
        } else {
          this.checkIfAllPredicted(username);
        }
        break;

      case "RuleChangeRequest":
        if (username === this.owner && this.phase === GamePhase.LOBBY) {
          this.changeRule(msg.rule, msg.value);
        }
        break;

      case "LayCard":
        this.layCard(username, msg);
        break;

      case "VoteForWinner":
        if (!this.playersRemainingForWinnerVoting.includes(username)) return;
        if (!this.players.includes(msg.value)) return;
        if (msg.value === username) return;

        pm.send(username, { type: "ShowWinnerPollModal", show: false });

        this.winnerVotingTally[msg.value] =
          (this.winnerVotingTally[msg.value] || 0) + 1;
        removeFromArray(this.playersRemainingForWinnerVoting, username);

        if (this.playersRemainingForWinnerVoting.length === 0) {
          this.winner = this.originalOrderForSubround.reduce(
            (maxPlayer, player) =>
              this.winnerVotingTally[player] >
              (this.winnerVotingTally[maxPlayer] || 0)
                ? player
                : maxPlayer,
          );
          const layedCardsValues = Object.values(this.layedCards);
          this.afterSubRound(
            containsCard(layedCardsValues, BOMB),
            containsCard(layedCardsValues, EVERYBODYPOINTS),
            this.stitchValue,
          );
        }
        break;

      case "ChangeStitchPrediction":
        if (username !== this.userToChangeStitchPrediction) return;
        if (Math.abs(msg.value) !== 1) return;
        const resultingStitchGoal = this.stitchGoals[username] + msg.value;
        if (resultingStitchGoal < 0 || resultingStitchGoal > this.round + 2)
          return; //TODO: reconsider upper bound for predictions
        pm.send(username, { type: "ShowChangeStitchModal", show: false });
        await new Promise((resolve) => setTimeout(resolve, 200));
        this.stitchGoals[username] += msg.value;
        this.userToChangeStitchPrediction = null;
        this.broadcast({
          type: "StitchGoalOf",
          name: username,
          goal: this.stitchGoals[username],
        });
        if (this.isSevenPointFiveUsed && this.cards[username].length > 0) {
          this.broadcast({ type: "SevenPointFiveUsed" });
        }
        this.newSubround();
        break;

      case "ChangeCard":
        if (
          !this.isSevenPointFiveUsed ||
          !containsCard(this.cards[username] || [], msg.card) ||
          this.cardsToChange[username]
        ) {
          return;
        }
        removeCard(this.cards[username], msg.card);
        this.cardsToChange[username] = msg.card;
        if (Object.keys(this.cardsToChange).length === this.players.length) {
          const playersIterator = this.players.values();
          const firstPlayer = playersIterator.next().value!;
          let player = firstPlayer;
          let nextPlayer: string;
          const newCards: { [key: string]: Card } = {};
          while (true) {
            const result = playersIterator.next();
            if (result.done) break;
            nextPlayer = result.value;
            this.cards[nextPlayer].push(this.cardsToChange[player]);
            newCards[nextPlayer] = this.cardsToChange[player];
            player = nextPlayer;
          }
          this.cards[firstPlayer].push(this.cardsToChange[player]);
          newCards[firstPlayer] = this.cardsToChange[player];
          for (const user of this.players) {
            pm.send(user, {
              type: "Cards",
              cards: this.cards[user],
            });
            pm.send(user, {
              type: "NewCardReceived",
              card: newCards[user],
            });
          }
          this.isSevenPointFiveUsed = false;
          this.newSubround();
        }
        break;

      default:
        console.warn(`Unknown message: ${msg}`);
    }
  }
}

function containsCard(cards: Card[], card: Card): boolean {
  return cards.some((c) => isSameCard(c, card));
}

function removeCard(cards: Card[], card: Card | ((card: Card) => boolean)) {
  const index = indexOfCard(cards, card);
  if (index !== -1) {
    const cardRemoved = cards[index];
    cards.splice(index, 1);
    return cardRemoved;
  }
}

function indexOfCard(
  cards: Card[],
  card: Card | ((card: Card) => boolean),
): number {
  const fn =
    typeof card === "function" ? card : (c: Card) => isSameCard(c, card);
  return cards.findIndex(fn);
}

function getShuffled<T>(original: T[]): T[] {
  const copy = original.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function removeFromArray<T>(array: T[], element: T): boolean {
  const index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}
