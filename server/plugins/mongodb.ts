import type { Collection, Db } from "mongodb";
import { MongoClient } from "mongodb";
import type { GameConfigBase } from "~/utils/types";

type UserPermission = {
  user: string;
  games: string[];
};

type PerfectAnswers = {
  host: string;
  gameID: string;
  uid: string;
  questionIndex: number;
  answer: string;
};

let client: MongoClient;
let db: Db;
let usersDb: Collection<UserPermission>;
let jeopardyDb: Collection<GameConfigBase>;
let nobodyIsPerfectDb: Collection<GameConfigBase>;
let perfectAnswersDb: Collection<PerfectAnswers>;

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const uri = config.mongodb;
  if (!uri) {
    throw new Error("Missing MongoDB URI");
  }
  client = new MongoClient(uri);
  db = client.db("games");
  usersDb = db.collection("users");
  jeopardyDb = db.collection("jeopardy");
  nobodyIsPerfectDb = db.collection("nobodyisperfect");
  perfectAnswersDb = db.collection("perfectanswers");
});

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error("MongoClient is not initialized");
  }
  return client;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
}

export function getUsersDb(): Collection<UserPermission> {
  if (!usersDb) {
    throw new Error("Users collection is not initialized");
  }
  return usersDb;
}

export function getJeopardyDb(): Collection<GameConfigBase> {
  if (!jeopardyDb) {
    throw new Error("Jeopardy collection is not initialized");
  }
  return jeopardyDb;
}

export function getNobodyIsPerfectDb(): Collection<GameConfigBase> {
  if (!nobodyIsPerfectDb) {
    throw new Error("NobodyIsPerfect collection is not initialized");
  }
  return nobodyIsPerfectDb;
}

export function getPerfectAnswersDb(): Collection<PerfectAnswers> {
  if (!perfectAnswersDb) {
    throw new Error("PerfectAnswers collection is not initialized");
  }
  return perfectAnswersDb;
}
