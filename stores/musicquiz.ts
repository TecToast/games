import { defineStore } from "pinia";
import type { MusicQuizData, UserData } from "~/utils/musicquiz/types";
import useTypedWebsocket from "~/composables/useTypedWebsocket";

export const useMusicQuizStore = defineStore("musicquiz", () => {
  const {
    gdata: gdata,
    status,
    refreshData,
    users,
    unsavedChanges,
    markUnsaved,
    saveToDB,
    route,
  } = useGameConfig<MusicQuizData, UserData>("musicquiz");
  const gamemode = ref("Hauptspiel");
  const levelnum = ref(-1);
  const revealed = ref(false);
  const currentSongData = ref("");
  const currentSongNumber = computed(() => {
    const data = gdata.value;
    if (!data) return "?/?";
    return `${levelnum.value + 1}/${data.tracks.length}`;
  });
  function revealUser(user: string) {
    const userdata = users.value;
    if (!userdata) return;
    userdata.data[user].visible = true;
  }
  function revealAll() {
    const userdata = users.value;
    if (!userdata) return;
    for (const user of Object.keys(userdata.data)) {
      userdata.data[user].visible = true;
    }
  }
  function revealReset() {
    const userdata = users.value;
    if (!userdata) return;
    for (const user of Object.keys(userdata.data)) {
      userdata.data[user].visible = false;
    }
    revealed.value = false;
  }
  function addPoints(user: string, points: number) {
    const userdata = users.value;
    if (!userdata) return;
    userdata.data[user].points += points;
  }
  function nextTrack(): string | null {
    const data = gdata.value;
    if (!data) return null;
    revealReset();
    resetGuesses();
    levelnum.value++;
    if (levelnum.value >= data.tracks.length) {
      levelnum.value = data.tracks.length - 1;
    }
    const newTrack = data.tracks[levelnum.value];
    currentSongData.value = `${newTrack.name}\nSpiel: ${newTrack.game}`;
    gamemode.value = newTrack.game;
    return newTrack.url;
  }
  function resetGuesses() {
    const data = users.value;
    if (!data) return;
    for (const user of Object.keys(data.data)) {
      data.data[user].guess = "...";
    }
  }
  function setGuess(user: string, guess: string) {
    const data = users.value;
    if (!data) return;
    data.data[user].guess = guess;
  }
  return {
    gdata,
    status,
    users,
    gamemode,
    levelnum,
    revealed,
    currentSongNumber,
    currentSongData,
    unsavedChanges,
    refreshData,
    markUnsaved,
    saveToDB,
    revealUser,
    revealAll,
    revealReset,
    addPoints,
    nextTrack,
    setGuess,
    resetGuesses,
  };
});
