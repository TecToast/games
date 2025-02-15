import type { WSMessage } from "./wizard/messages";

export function watchMessage<B extends { type: string }, M extends B["type"]>(
  ref: Ref<unknown>,
  type: M,
  callback: (data: Extract<B, { type: M }>) => void,
) {
  watch(ref, (data) => {
    if (typeof data === "string") {
      try {
        const message = JSON.parse(data);
        if (message.type === type) {
          callback(message);
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}

export function watchWizard<M extends WSMessage["type"]>(
  ref: Ref<unknown>,
  type: M,
  callback: (data: Extract<WSMessage, { type: M }>) => void,
) {
  return watchMessage<WSMessage, M>(ref, type, callback);
}

type ExtractOtherKey<
  T extends { type: string },
  K extends T["type"],
> = T extends {
  type: K;
}
  ? {
      [P in keyof T]: P extends "type" ? never : T[P];
    }[keyof T]
  : never;
export function useWebsocketRef<
  B extends { type: string },
  M extends B["type"],
>(reference: Ref<unknown>, type: M, start: ExtractOtherKey<B, M>) {
  const result = ref(start);
  const notSet = ref(true);
  watchMessage(reference, type, (data) => {
    // @ts-expect-error - this is fine
    result.value =
      data[Object.keys(data).find((k) => k !== "type") as keyof typeof data];
    notSet.value = false;
  });
  return { result, notSet };
}
export function useWizardRef<M extends WSMessage["type"]>(
  reference: Ref<unknown>,
  type: M,
  start: ExtractOtherKey<WSMessage, M>,
) {
  return useWebsocketRef<WSMessage, M>(reference, type, start);
}
