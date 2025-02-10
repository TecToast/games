export default defineEventHandler(async (event) => {
  const { name } = await readBody(event);
  await setUserSession(event, { user: { id: "1", name } });
  return null;
});
