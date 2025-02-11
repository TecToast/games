import { type ServerFile } from "nuxt-file-storage";
import * as crypto from "crypto";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const { file } = await readBody<{ file: ServerFile }>(event);
  const { binaryString, ext } = parseDataUrl(file.content);
  const key = `${crypto.randomUUID()}.${ext}`;
  const storage = useStorage("media");
  storage.setItemRaw(key, binaryString);
  return key;
});
