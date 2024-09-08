export default function (url: MaybeRefOrGetter<string>) {
  const { status, data, send, open } = useWebSocket(url, {
    autoReconnect: true,
  });

  function sendWS(type: string, data: any) {
    send(JSON.stringify({ type, ...data }));
  }
  return { status, data, sendWS };
}
