import { Color, type Card } from "./types";

export const NOTHINGCARD: Card = { color: Color.Special, value: 0 };
export const BOMB: Card = { color: Color.Special, value: 1 };
export const SEVENPOINTFIVE: Card = { color: Color.Special, value: 7.5 };
export const NINEPOINTSEVENFIVE: Card = { color: Color.Special, value: 9.75 };
export const FAIRY: Card = { color: Color.Special, value: -1 };
export const DRAGON: Card = { color: Color.Special, value: 14 };
export const DEEZNUTS: Card = { color: Color.Special, value: 69 };
export const TROLL: Card = { color: Color.Special, value: 1 };
export const STONKS: Card = { color: Color.Special, value: 2 };
export const BLOCKED: Card = { color: Color.Special, value: 3 };
export const REVERSE: Card = { color: Color.Special, value: 6 };
export const DEMOCRACY: Card = { color: Color.Special, value: 7 };
export const GAMBLING: Card = { color: Color.Special, value: 1 };
export const EVERYBODYPOINTS: Card = { color: Color.Special, value: 2 };
export const FLEXTAPE: Card = { color: Color.Special, value: 3 };
export const rainbowCards: Card[] = [
  SEVENPOINTFIVE,
  NINEPOINTSEVENFIVE,
  TROLL,
  DEEZNUTS,
  STONKS,
];
