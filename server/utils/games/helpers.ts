import { collections } from "./constants";

export async function getQuizData(game: string, id: string, host: string) {
  const coll = collections[game];
  if (!coll) throw createError({ status: 404, message: "Game not found" });
  const queryResult = await coll.findOne({ host, id });
  if (!queryResult)
    throw createError({ status: 404, message: "GameID not found" });
  const { _id, ...result } = queryResult;
  return result;
}
