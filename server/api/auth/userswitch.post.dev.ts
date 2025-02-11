export default defineEventHandler(async (event) => {
  const { name, id } = await readBody(event);
  await setUserSession(event, { user: { id: id || "1", name } });
  return null;
});
