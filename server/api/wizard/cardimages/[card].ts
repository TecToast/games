import { promises as fs } from "fs";
import path from "path";
import { defineEventHandler, send } from "h3";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const card = getRouterParam(event, "card");

  // Define the path to the image file
  const imagePath = path.join(
    process.env.GAMES_CARDS ?? process.cwd() + "/cards/wizard",
    `${card}`,
  ); // Adjust the path and extension as needed

  try {
    // Read the image file
    const image = await fs.readFile(imagePath);

    // Send the image as a response
    appendHeader(event, "Content-Type", "image/webp");
    appendHeader(event, "Cache-Control", "max-age=31536000");
    return send(event, image);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Handle the error if the file is not found or any other error occurs
    event.node.res.statusCode = 404;
    return { error: "Image not found" };
  }
});
