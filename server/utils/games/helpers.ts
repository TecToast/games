import { collections, defaultGameUserData } from "./constants";
import { client } from "~/server/plugins/discord";

export async function getQuizData(game: string, id: string, host: string) {
  const coll = collections[game];
  if (!coll) throw createError({ status: 404, message: "Game not found" });
  const queryResult = await coll.findOne({ host, id });
  if (!queryResult)
    throw createError({ status: 404, message: "GameID not found" });
  const { _id, ...result } = queryResult;
  const defaultUserData = defaultGameUserData[game]!;
  const userCache = useStorage("redis");
  console.log(result);
  return {
    ...result,
    participants: Object.fromEntries(
      await Promise.all(
        result.participantsList.map(async (uid) => {
          let userDisplayData = await userCache.getItem<{
            n: string;
            a: string;
          }>(`displaydata:${uid}`);
          if (userDisplayData === null) {
            userDisplayData = await getDiscordUserData(uid);
            await userCache.setItem(`displaydata:${uid}`, userDisplayData, {
              ttl: 60 * 60 * 24 * 7,
            });
          }
          return [
            uid,
            {
              avatarUrl: userDisplayData.a,
              displayName: userDisplayData.n,
              data: defaultUserData,
            },
          ];
        }),
      ),
    ),
  };
}

async function getDiscordUserData(uid: string) {
  const user = await client.users.fetch(uid);
  return {
    n: user.displayName,
    a: user.avatarURL()?.replace(".gif", ".png") ?? user.defaultAvatarURL,
  };
}
