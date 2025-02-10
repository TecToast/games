import { defineGameHandler } from "~/server/utils/games/authenticated";

export default defineGameHandler(async (event, uid, _game, coll) => {
  const { id, participants, participantsList, host, ...data } =
    await readBody(event);
  await coll.updateOne({ id, host: uid }, { $set: data });
});
