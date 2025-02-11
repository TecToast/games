import { Peer } from "crossws";
let host: string | undefined = undefined;
let peers: { [key: string]: Peer } = {};
let peerIDToUserID: { [key: string]: string } = {};
export default defineWebSocketHandler({
  open: async (peer) => {
    console.log("OPENING");
    const session = await requireUserSession(peer);
    console.log("SESSION", session.user.id, peer.id);
    peerIDToUserID[peer.id] = session.user.id;
    peers[session.user.id] = peer;
  },
  async message(peer, message) {
    const msg: any = message.json();
    console.log(peer.id);
    console.log("V");
    console.log(msg);
    if (msg.host) {
      console.log("HOST MESSAGE IT IS");
      host = peer.id;
      peers[host] = peer;
      peer.peers.forEach((p) => {
        if (peer.id !== p.id) {
          p.send(JSON.stringify({ reconnect: true }));
        }
      });
      return;
    }
    if (peer.id === host) {
      peers[msg.to].send(JSON.stringify(msg));
    } else {
      if (host) {
        const sendMsg = JSON.stringify({
          ...msg,
          userid: peerIDToUserID[peer.id],
        });
        peers[host].send(sendMsg);
      }
    }
  },
});
