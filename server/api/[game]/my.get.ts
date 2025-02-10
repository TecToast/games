import { defineGameHandler } from "~/server/utils/games/authenticated";

export default defineGameHandler(async (_event, uid, _game, coll) => {
  return await coll
    .find({ host: uid })
    .project({ _id: 0, id: 1 })
    .map((d) => d.id)
    .toArray();
});
