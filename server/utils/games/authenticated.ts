import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import type { Collection } from "mongodb";
import type { GameConfigBase } from "~/utils/types";
import { getCollection } from "./constants";

type EventHandlerWithGame<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  uid: string,
  game: string,
  coll: Collection<GameConfigBase>,
) => Promise<D>;

export const defineGameHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandlerWithGame<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const { user } = await requireUserSession(event);
    const game = getRouterParam(event, "game")!;
    const coll = getCollection(game);
    if (!coll) throw createError({ status: 404, message: "Game not found" });
    return handler(event, user.id, game, coll);
  });
