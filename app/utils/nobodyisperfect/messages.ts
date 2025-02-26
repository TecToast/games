import { z } from "zod";

export const perfectAnswersSchema = z.object({
  host: z.string(),
  gameID: z.string(),
  answers: z.record(z.string()),
  questionIndex: z.number(),
});

export type PerfectAnswersRequest = z.infer<typeof perfectAnswersSchema>;
