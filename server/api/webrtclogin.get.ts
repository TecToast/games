export default defineEventHandler(async (event) => {
  const token = getQuery(event)["token"];
  const redis = useStorage("redis");
  const user = await redis.get<{ id: string; name: string }>(
    "webrtclogin:" + token,
  );
  if (!user) return;
  await setUserSession(event, {
    user,
  });
  await sendRedirect(event, "/webrtc");
});
