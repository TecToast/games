import { type ParticipantData } from "~/utils/types";
import { client } from "~/server/plugins/discord";
import { GuildMember } from "discord.js";

export default defineCachedEventHandler(
  async (event) => {
    await requireUserSession(event);
    const guild = await client.guilds.fetch(useRuntimeConfig().discord.guild);
    // TODO: fetch only required users
    const members = await guild.members.fetch();
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

function getAvatarUrl(user: GuildMember) {
  let avatar = user.displayAvatarURL();
  avatar = avatar.substring(0, avatar.lastIndexOf(".")) + ".png?size=512";
  return avatar;
}
