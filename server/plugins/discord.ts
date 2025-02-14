import {
  Client,
  Events,
  MessageFlags,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

export let client: Client;

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  const { token, guild } = config.discord;
  client = new Client({ intents: ["GuildMembers"] });
  await client.login(token);
  client.rest.put(Routes.applicationGuildCommands(client.user!.id, guild), {
    body: [
      new SlashCommandBuilder()
        .setName("login")
        .setDescription("Login")
        .toJSON(),
    ],
  });
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "login") {
      const token = crypto.randomUUID();
      const redis = useStorage("redis");
      await redis.setItem("webrtclogin:" + token, {
        id: interaction.user.id,
        name: interaction.user.displayName,
      });
      await interaction.reply({
        content: `https://${config.public.host}/api/webrtclogin?token=${token}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  });
});
