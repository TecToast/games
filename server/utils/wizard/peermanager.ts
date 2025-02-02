import { Peer } from "crossws";
import { WSMessage } from "~/utils/wizard/messages";
const peers = new Map<string, Peer>();

function register(user: string, peer: Peer) {
  peers.set(user, peer);
}

function send(user: string, message: WSMessage) {
  const peer = peers.get(user);
  if (peer) {
    peer.send(message);
  }
}

function get(user: string) {
  return peers.get(user)!;
}

function broadcast(message: WSMessage) {
  for (const peer of peers.values()) {
    peer.send(message);
  }
}

export { register, send, get, broadcast };
