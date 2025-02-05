import type { UnwrapRef } from "vue";

export function watchMessage(
  ref: Ref<unknown>,
  type: string,
  callback: (data: any) => void,
) {
  watch(ref, (data) => {
    console.log("watching", data);
    console.log("watching type", typeof type);
    if (typeof data === "string") {
      try {
        const message = JSON.parse(data);
        console.log("watching message", message);
        if (message.type === type) {
          callback(message);
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}

export function useWebsocketRef<T>(
  reference: Ref<unknown>,
  type: string,
  key: string,
  start: T,
) {
  const result = ref<T>(start);
  const notSet = ref(true);
  watchMessage(reference, type, (data) => {
    result.value = data[key];
    notSet.value = false;
  });
  return { result, notSet };
}
