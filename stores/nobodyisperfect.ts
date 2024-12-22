import { defineStore } from "pinia";
import useGameConfig from "~/composables/useGameConfig";
import type {
  NobodyIsPerfectData,
  UserData,
} from "~/utils/nobodyisperfect/types";

export const useNobodyIsPerfectStore = defineStore("nobodyisperfect", () => {
  const {
    gdata,
    status,
    error,
    refreshData,
    users,
    unsavedChanges,
    markUnsaved,
    saveToDB,
  } = useGameConfig<NobodyIsPerfectData, UserData>("nobodyisperfect");

  function addPointsToUser(user: string, points: number) {
    const userdata = users.value;
    if (!userdata) return;
    userdata.data[user].points += points;
  }

  return {
    gdata,
    status,
    error,
    users,

    unsavedChanges,

    addPointsToUser,

    refreshData,
    markUnsaved,
    saveToDB,
  };
});
