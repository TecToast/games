export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig();
  if (config.public.protectedUrls.find((url) => to.path.startsWith(url))) {
    const { loggedIn } = useUserSession();
    if (!loggedIn.value) {
      return navigateTo("/");
    }
    const { data: games } = await useFetch("/api/mygames");
    if (
      !games.value ||
      !games.value.find((game) =>
        to.path.startsWith("/" + game.url.split("/")[1]),
      )
    ) {
      return navigateTo("/");
    }
  }
});
