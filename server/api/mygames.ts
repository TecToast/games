import { allGames } from "~/utils/types";
import { usersDb } from "../plugins/mongodb";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userPermission = await usersDb.findOne({ user: session.user.id });
  if (!userPermission) return [];
  return userPermission.games.map((game) => allGames[game]);
});
