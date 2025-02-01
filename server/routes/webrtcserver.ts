import { Peer } from 'crossws';

let host: string | undefined = undefined;
let peers: { [key: string]: Peer } = {};

export default defineWebSocketHandler({
  message(peer, message) {
    const msg: any = message.json();
    if (msg.host) {
      host = peer.id;
      peers[host] = peer;
      peer.peers.forEach(p => {
        if (peer.id !== p.id) {
          p.send(JSON.stringify({ reconnect: true }));
        }
      })
      return;
    } else if (msg.userid) {
      peers[msg.userid] = peer;
    }
    console.log(JSON.stringify(msg));
    if (peer.id === host) {
      peers[msg.to].send(JSON.stringify(msg));
    } else {
      if (host) peers[host].send(JSON.stringify(msg));
    }
  }
})

