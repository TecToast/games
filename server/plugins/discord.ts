import { Client } from "discord.js";

export let client: Client;

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const { token } = config.discord;
  client = new Client({ intents: [] });
  client.login(token);
});
