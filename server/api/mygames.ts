import { allGames } from "~/utils/types";
import { getUsersDb } from "../plugins/mongodb";

export default defineEventHandler(async (event) => {
  if (import.meta.dev) {
    return Object.values(allGames);
  }
  const session = await getUserSession(event);
  if (!session.user) return [];
  const userPermission = await getUsersDb().findOne({ user: session.user.id });
  if (!userPermission) return [];
  return userPermission.games.map((game) => allGames[game]);
});
