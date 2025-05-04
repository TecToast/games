import memoryDriver from "unstorage/drivers/memory";
import fsDriver from "unstorage/drivers/fs-lite";

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const storage = useStorage();
  const auth = memoryDriver();
  const media = fsDriver({
    base: config.media.base,
  });
  storage.mount("auth", auth);
  storage.mount("media", media);
});
