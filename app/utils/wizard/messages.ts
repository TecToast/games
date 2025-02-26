import type { Color, Card, LayedCard, OpenGamesData, Rule } from "./types";
import type { BaseMessage } from "~/utils/types";

export type WSMessage =
  | CreateGame
  | JoinGame
  | StartButtonClicked
  | LeaveGame
  | StitchGoal
  | LayCard
  | RuleChangeRequest
  | ChangeUsername
  | ChangeStitchPrediction
  | VoteForWinner
  | ChangeCard
  | RequestSelectedRole
  | GameCreated
  | GameInfo
  | RuleChange
  | StitchGoalOf
  | EndGame
  | Round
  | FirstCome
  | Results
  | Cards
  | NewCardReceived
  | PlayerCard
  | CurrentPlayer
  | Trump
  | TrumpShifted
  | Winner
  | ClearForNewSubRound
  | IsPredict
  | UpdateDoneStitches
  | GameStarted
  | OpenGames
  | RedirectHome
  | HasPredicted
  | AcceptedGoal
  | ShowChangeStitchModal
  | SevenPointFiveUsed
  | ShowWinnerPollModal
  | SelectedRoles
  | CurrentRoleSelectingPlayer;

interface CreateGame extends BaseMessage {
  type: "CreateGame";
}

interface JoinGame extends BaseMessage {
  type: "JoinGame";
  gameID: number;
}

interface StartButtonClicked extends BaseMessage {
  type: "StartButtonClicked";
}

interface LeaveGame extends BaseMessage {
  type: "LeaveGame";
  gameID: number;
}

interface StitchGoal extends BaseMessage {
  type: "StitchGoal";
  goal: number;
}

export interface LayCard extends BaseMessage {
  type: "LayCard";
  card: Card;
  selectedColor?: Color;
}

interface RuleChangeRequest extends BaseMessage {
  type: "RuleChangeRequest";
  rule: Rule;
  value: string;
}

interface ChangeUsername extends BaseMessage {
  type: "ChangeUsername";
  username: string;
}

interface ChangeStitchPrediction extends BaseMessage {
  type: "ChangeStitchPrediction";
  value: number;
}

interface VoteForWinner extends BaseMessage {
  type: "VoteForWinner";
  value: string;
}

interface ChangeCard extends BaseMessage {
  type: "ChangeCard";
  card: Card;
}

interface RequestSelectedRole extends BaseMessage {
  type: "RequestSelectedRole";
  roleName: string;
}

// ############################### RESPONSES ###############################

interface GameCreated extends BaseMessage {
  type: "GameCreated";
  gameID: number;
}

interface GameInfo extends BaseMessage {
  type: "GameInfo";
  players: string[];
}

interface RuleChange extends BaseMessage {
  type: "RuleChange";
  rules: { [k: string]: string };
}

interface StitchGoalOf extends BaseMessage {
  type: "StitchGoalOf";
  name: string;
  goal: number;
}

interface EndGame extends BaseMessage {
  type: "EndGame";
  players: { player: string; points: number }[];
}

interface Round extends BaseMessage {
  type: "Round";
  round: number;
}

interface FirstCome extends BaseMessage {
  type: "FirstCome";
  player: string;
}

interface Results extends BaseMessage {
  type: "Results";
  results: { [k: string]: number };
}

interface Cards extends BaseMessage {
  type: "Cards";
  cards: Card[];
}

interface NewCardReceived extends BaseMessage {
  type: "NewCardReceived";
  card: Card;
}

interface PlayerCard extends BaseMessage {
  type: "PlayerCard";
  card: LayedCard;
}

interface CurrentPlayer extends BaseMessage {
  type: "CurrentPlayer";
  player: string;
}

interface Trump extends BaseMessage {
  type: "Trump";
  trump: Card;
}

interface TrumpShifted extends BaseMessage {
  type: "TrumpShifted";
  shifted: { [k: string]: number };
}

interface Winner extends BaseMessage {
  type: "Winner";
  winner: string | null;
}

interface ClearForNewSubRound extends BaseMessage {
  type: "ClearForNewSubRound";
}

interface IsPredict extends BaseMessage {
  type: "IsPredict";
  isPredict: boolean;
}

interface UpdateDoneStitches extends BaseMessage {
  type: "UpdateDoneStitches";
  player: string;
  amount: number;
}

interface GameStarted extends BaseMessage {
  type: "GameStarted";
  players: string[];
}

export interface OpenGames extends BaseMessage {
  type: "OpenGames";
  games: OpenGamesData;
}

interface RedirectHome extends BaseMessage {
  type: "RedirectHome";
}

interface HasPredicted extends BaseMessage {
  type: "HasPredicted";
  name: string;
}

interface AcceptedGoal extends BaseMessage {
  type: "AcceptedGoal";
}

interface ShowChangeStitchModal extends BaseMessage {
  type: "ShowChangeStitchModal";
  show: boolean;
}

interface SevenPointFiveUsed extends BaseMessage {
  type: "SevenPointFiveUsed";
}

interface ShowWinnerPollModal extends BaseMessage {
  type: "ShowWinnerPollModal";
  show: boolean;
}

interface SelectedRoles extends BaseMessage {
  type: "SelectedRoles";
  roles: { [k: string]: string };
}

interface CurrentRoleSelectingPlayer extends BaseMessage {
  type: "CurrentRoleSelectingPlayer";
  currentPlayer: string;
}
