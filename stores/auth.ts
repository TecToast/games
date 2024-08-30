import { defineStore } from "pinia";

export const useAuthStore = defineStore("Auth", () => {
  const { data, status } = useFetch<GameMeta[]>("/api/mygames");
  return { data, status };
});
