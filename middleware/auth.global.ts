export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig();
  if (config.public.protectedUrls.find((url) => to.path.startsWith(url))) {
    const store = useAuthStore();
    const { data, status } = storeToRefs(store);
    await until(status).not.toBe("pending");
    if (store.status !== "success") {
      return navigateTo("/");
    }
    if (
      !data.value!.games.find((game) =>
        to.path.startsWith("/" + game.url.split("/")[1]),
      )
    ) {
      return navigateTo("/");
    }
  }
});
