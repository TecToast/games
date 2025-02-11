export const getMyGames = async () => {
  const state = useState<GameMeta[]>("mygames");
  if (state.value === undefined) {
    state.value = await useRequestFetch()("/api/mygames");
  }
  return state.value;
};
