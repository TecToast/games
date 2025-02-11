export default defineEventHandler(async (event) => {
  console.log("Dummy accessed");
  return "Hello World!";
});
