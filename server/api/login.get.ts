import { getUsersDb } from "~/server/plugins/mongodb";

export default defineOAuthDiscordEventHandler({
  config: {},
  async onSuccess(event, { user }) {
    if (!(await getUsersDb().findOne({ user: user.id }))) {
      await sendRedirect(event, "/error/notwhitelisted");
      return;
    }
    await setUserSession(event, {
      user: {
        id: user.id,
        name: user.global_name,
      },
    });
    await sendRedirect(event, "/");
  },
});
