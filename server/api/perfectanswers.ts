import { getPerfectAnswersDb } from "../plugins/mongodb";
import { perfectAnswersSchema } from "~/utils/nobodyisperfect/messages";

export default defineEventHandler(async (event) => {
  const { host, gameID, answers, questionIndex } = await readValidatedBody(
    event,
    perfectAnswersSchema.parse,
  );
  if (questionIndex >= 0) {
    Object.entries(answers).forEach(([uid, answer]) => {
      getPerfectAnswersDb().updateOne(
        {
          host,
          gameID,
          uid,
          questionIndex,
        },
        { $set: { answer } },
        { upsert: true },
      );
    });
  }
});
