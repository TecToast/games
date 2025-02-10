import { defineGameHandler } from "~/server/utils/games/authenticated";
import { getQuizData } from "~/server/utils/games/helpers";

export default defineGameHandler(async (event, uid, game) => {
  return getQuizData(game, getRouterParam(event, "id")!, uid);
});
