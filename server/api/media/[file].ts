export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const storage = useStorage("media");
  return storage.getItemRaw(getRouterParam(event, "file")!);
});
