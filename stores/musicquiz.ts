import { defineStore } from "pinia";
import type { MusicQuizData, UserData } from "~/utils/musicquiz/types";

export const useMusicQuizStore = defineStore("musicquiz", () => {
  const {
    gdata: gdata,
    status,
    error,
    refreshData,
    users,
    unsavedChanges,
    markUnsaved,
    saveToDB,
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
  function nextTrack() {
    const data = gdata.value;
    if (!data) return;
    revealed.value = false;
    levelnum.value++;
    if (levelnum.value >= data.tracks.length) {
      levelnum.value = data.tracks.length - 1;
    }
    const newTrack = data.tracks[levelnum.value];
    currentSongData.value = `${newTrack.name}\nSpiel: ${newTrack.game}`;
  }
  function pause() {}
  function resume() {}
  function restart() {}
  function jumpToTrack(track: number) {
    const data = gdata.value;
    if (!data) return;
    const num = Math.min(Math.max(0, track), data.tracks.length - 1);
    levelnum.value = num;
    revealReset();
    playTrack(num);
  }
  function playTrack(track: number | string) {}
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
    pause,
    resume,
    restart,
    jumpToTrack,
    playTrack,
  };
});
