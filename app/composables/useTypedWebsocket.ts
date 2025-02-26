export default function <T>(url: MaybeRefOrGetter<string>) {
  const { status, data, send } = useWebSocket(url, {
    autoReconnect: true,
  });

  function sendWS(data: T) {
    send(JSON.stringify(data));
  }
  return { status, data, sendWS };
}
