import { defineStore } from "pinia";

export const useAuthStore = defineStore("Auth", () => {
  const { data, status } = useFetch<{ name: string; games: GameMeta[] }>(
    "/api/mygames",
    {
      credentials: "include",
    },
  );
  return { data, status };
});
