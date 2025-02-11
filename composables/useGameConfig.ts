import { type RouteLocationNormalizedGeneric, useRoute } from "vue-router";
import type { AsyncDataRequestStatus, NuxtError } from "#app";
import type { GameConfigBase } from "~/utils/types";

export default function <T extends GameConfigBase, GUserData>(gameId: string) {
  const route = useRoute();
  const users: Ref<{
    data: { [key: string]: GUserData };
    list: string[];
  } | null> = ref(null);
  const {
    data: gdata,
    status,
    error,
    refresh: refreshData,
  } = useAsyncData(
    gameId,
    // @ts-ignore
    async () => {
      if (route.params.id && route.fullPath.includes(gameId)) {
        const result = await useRequestFetch()<T>(
          `/api/${gameId}/data/${route.params.id}`,
        );
        // TODO update once users get modified
        users.value = {
          data: Object.fromEntries(
            // @ts-ignore
            result.participantsList.map((p) => [
              p,
              { ...defaultGameUserData[gameId] },
            ]),
          ),
          list: result.participantsList,
        };
        return result;
      }
      return new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 500),
      );
    },
    // @ts-ignore
    { deep: true, watch: () => route.params.id },
  );
  // const gdata = computed(() => ggdata.value as T | null);
  const unsavedChanges = ref(false);

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
    users,
    unsavedChanges,
    markUnsaved,
    saveToDB,
  } as {
    route: RouteLocationNormalizedGeneric;
    gdata: Ref<T | null>;
    status: Ref<AsyncDataRequestStatus>;
    error: Ref<NuxtError | null>;
    refreshData: () => void;
    users: Ref<{ data: { [key: string]: GUserData }; list: string[] } | null>;
    unsavedChanges: Ref<boolean>;
    markUnsaved: () => void;
    saveToDB: () => void;
  };
}
