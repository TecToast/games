import { Peer } from "crossws";
import { WSMessage } from "~/utils/wizard/messages";
export default {
  peers: new Map<string, Peer>(),

  register(user: string, peer: Peer) {
    this.peers.set(user, peer);
  },

  send(user: string, message: WSMessage) {
    const peer = this.peers.get(user);
    if (peer) {
      peer.send(message);
    }
  },

  get(user: string) {
    return this.peers.get(user)!;
  },

  broadcast(message: WSMessage) {
    for (const peer of this.peers.values()) {
      peer.send(message);
    }
  },
};
