import { defineGameHandler } from "+/utils/games/authenticated";
import { getQuizData } from "+/utils/games/helpers";

export default defineGameHandler(async (event, uid, game) => {
  return getQuizData(game, getRouterParam(event, "id")!, uid);
});
