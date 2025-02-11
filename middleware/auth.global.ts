export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig();
  if (config.public.userdataRequired.find((url) => to.path.startsWith(url))) {
    await fetchUsersOnServer();
  }
  if (config.public.protectedUrls.find((url) => to.path.startsWith(url))) {
    const { loggedIn } = useUserSession();
    if (!loggedIn.value) {
      return navigateTo("/");
    }
    const games = await fetchMyGames();
    if (
      !games ||
      !games.find((game) => to.path.startsWith("/" + game.url.split("/")[1]))
    ) {
      return navigateTo("/");
    }
  }
});
