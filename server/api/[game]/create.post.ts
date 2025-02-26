import { defineGameHandler } from "+/utils/games/authenticated";
import { defaultQuizData } from "+/utils/games/constants";

export default defineGameHandler(async (event, uid, game, coll) => {
  const { id } = await readBody(event);
  coll.insertOne({
    id,
    host: uid,
    participantsList: [],
    ...defaultQuizData[game],
  });
  return null;
});
