export default defineEventHandler(async (event) => {
  const userAgent = getHeader(event, "User-Agent");
  if (userAgent?.includes("Discord")) {
    return;
  }
  const token = getQuery(event)["token"];
  const auth = useStorage("auth");
  const user = await auth.getItem<{ id: string; name: string }>(
    "webrtclogin:" + token,
  );
  if (!user) return "Invalid token";
  await auth.removeItem("webrtclogin:" + token);
  await setUserSession(event, {
    user,
  });
  await sendRedirect(event, "/webrtc");
});
