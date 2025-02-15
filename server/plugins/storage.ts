import redisDriver from "unstorage/drivers/redis";
import fsDriver from "unstorage/drivers/fs-lite";

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const storage = useStorage();
  const redis = redisDriver({
    host: config.redis.host,
    port: config.redis.port,
    base: "gamecache",
  });
  const media = fsDriver({
    base: config.media.base,
  });
  storage.mount("redis", redis);
  storage.mount("media", media);
});
