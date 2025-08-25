import { type RouteLocationNormalizedGeneric, useRoute } from "vue-router";
import type { AsyncDataRequestStatus, NuxtError } from "#app";
import type { GameConfigBase } from "~/utils/types";

export default function <T extends GameConfigBase, GUserData>(gameId: string) {
  const route = useRoute();
  const userdata: Ref<{
    [key: string]: GUserData;
  }> = ref({});
  const {
    data: gdataOrig,
    status,
    error,
    refresh: refreshData,
  } = useAsyncData(
    gameId,
    async () => {
      if (route.params.id && route.fullPath.includes(gameId)) {
        const result = await useRequestFetch()<T>(
          `/api/${gameId}/data/${route.params.id}`,
        );
        userdata.value = Object.fromEntries(
          result.participantsList.map((p) => [
            p,
            { ...getDefaultGameUserData(gameId) },
          ]),
        );
        return result as T;
      }
      return new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 500),
      );
    },
    { deep: true, watch: [() => route.params.id] },
  );
  const gdata = ref<T | null>(null);
  watch(
    gdataOrig,
    (data) => {
      gdata.value = data as T;
    },
    { immediate: true },
  );
  const unsavedChanges = ref(false);

  function usersUpdatedHandler() {
    const data = gdata.value;
    if (data) {
      const oldData = userdata.value;
      userdata.value = Object.fromEntries(
        data.participantsList.map((p: string) => [
          p,
          oldData[p] || ({ ...getDefaultGameUserData(gameId) } as GUserData),
        ]),
      );
    }
  }

  function markUnsaved() {
    unsavedChanges.value = true;
  }

  function saveToDB() {
    const data = gdata.value;
    if (!data) return;
    $fetch(`/api/${gameId}/update/${route.params.id}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        unsavedChanges.value = false;
      })
      .catch(() => {
        alert("Error saving data");
      });
  }

  return {
    route,
    gdata,
    status,
    error,
    refreshData,
    userdata,
    unsavedChanges,
    markUnsaved,
    saveToDB,
    usersUpdatedHandler,
  } as {
    route: RouteLocationNormalizedGeneric;
    gdata: Ref<T | null>;
    status: Ref<AsyncDataRequestStatus>;
    error: Ref<NuxtError | null>;
    refreshData: () => void;
    userdata: Ref<{ [key: string]: GUserData }>;
    unsavedChanges: Ref<boolean>;
    markUnsaved: () => void;
    saveToDB: () => void;
    usersUpdatedHandler: () => void;
  };
}
