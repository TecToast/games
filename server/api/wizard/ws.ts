import * as pm from "~/server/utils/wizard/peermanager";

export default defineWebSocketHandler({
  upgrade: async (request) => {
    await requireUserSession(request);
  },
  open: async (peer) => {
    const { user } = await requireUserSession(peer);
    const { id, name } = user;
    pm.register(id, peer);
  },
  message: async (peer, message) => {},
});
