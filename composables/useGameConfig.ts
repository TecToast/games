import { type RouteLocationNormalizedGeneric, useRoute } from "vue-router";
import type { AsyncDataRequestStatus, NuxtError } from "#app";
import type { GameConfigBase, UserData } from "~/utils/types";

export default function <T extends GameConfigBase<GUserData>, GUserData>(
  gameId: string,
) {
  const route = useRoute();
  const {
    data: gdata,
    status,
    error,
    refresh: refreshData,
  } = useAsyncData(
    gameId,
    // @ts-ignore
    () => {
      if (route.params.id && route.fullPath.includes(gameId)) {
        return $fetch<T>(`/api/${gameId}/data/${route.params.id}`);
      }
      return new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 500),
      );
    },
    // @ts-ignore
    { deep: true, watch: () => route.params.id },
  );
  // const gdata = computed(() => ggdata.value as T | null);
  const users = computed(() => {
    const data = gdata.value;
    if (!data) return null;
    // @ts-ignore
    return { list: data.participantsList, data: data.participants } as {
      list: string[];
      data: { [key: string]: UserData<GUserData> };
    };
  });
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
    users: Ref<{
      list: string[];
      data: { [key: string]: UserData<GUserData> };
    } | null>;
    unsavedChanges: Ref<boolean>;
    markUnsaved: () => void;
    saveToDB: () => void;
  };
}
