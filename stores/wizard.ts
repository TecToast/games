import { defineStore } from "pinia";

export const useWizardStore = defineStore("wizard", () => {
  const openGames = ref<{ owner: string; id: number }[]>([
    { owner: "Flo", id: 0 },
  ]);
  function createGame() {}
  const { data, status, sendWS } = useTypedWebsocket(
    process.env.NODE_ENV === "development"
      ? `ws://localhost:9934/api/wizard/ws`
      : `wss://games.tectoast.de/api/wizard/ws`,
  );

  return { openGames, createGame, data, status, sendWS };
});
