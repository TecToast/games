export const fetchMyGames = async () => {
  const state = useState<GameMeta[]>("mygames");
  if (state.value === undefined) {
    state.value = await useRequestFetch()<GameMeta[]>("/api/mygames");
  }
  return state.value;
};

export const getMyGames = () => {
  const state = useState<GameMeta[]>("mygames");
  return state.value;
};

export const fetchUsersOnServer = async () => {
  const state = useState<{ [id: string]: ParticipantData }>("usersonserver");
  if (state.value === undefined) {
    state.value = await useRequestFetch()<{ [id: string]: ParticipantData }>(
      "/api/allusers",
    );
  }
  return state.value;
};

export const getUsersOnServer = () => {
  const state = useState<{ [id: string]: ParticipantData }>("usersonserver");
  return state.value;
};
