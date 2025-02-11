import { Collection, Db, MongoClient } from "mongodb";
import { type JeopardyData } from "~/utils/jeopardy/types";
import { type NobodyIsPerfectData } from "~/utils/nobodyisperfect/types";
import { type GameConfigBase } from "~/utils/types";

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

export let client: MongoClient;
export let db: Db;
export let usersDb: Collection<UserPermission>;
export let jeopardyDb: Collection<GameConfigBase>;
export let nobodyIsPerfectDb: Collection<GameConfigBase>;
export let perfectAnswersDb: Collection<PerfectAnswers>;

export default defineNitroPlugin((nitroApp) => {
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
