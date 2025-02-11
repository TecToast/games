import { type ParticipantData } from "~/utils/types";
import { client } from "../plugins/discord";
import { getAvatarUrl } from "../utils/games/helpers";

export default defineCachedEventHandler(
  async (event) => {
    const guild = await client.guilds.fetch(useRuntimeConfig().discord.guild);
    const members = await guild.members.fetch();
    // console.log(members);
    const result: { [id: string]: ParticipantData } = Object.fromEntries(
      members
        .entries()
        .map(([id, member]) => {
          return [
            id,
            {
              avatarUrl: getAvatarUrl(member),
              displayName: member.displayName,
            } satisfies ParticipantData,
          ];
        })
        .toArray(),
    );
    return result;
  },
  { maxAge: 60 * 60 * 24 },
);
