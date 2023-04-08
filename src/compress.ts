import { pipeline } from "node:stream";
import * as archiver from "npm:archiver";
import { createWriteStream } from "node:fs";
import { Tar } from "https://deno.land/std@0.182.0/archive/tar.ts";
import { copy } from "https://deno.land/std@0.182.0/streams/copy.ts";

export async function tar(files: string[], output: string) {
  const tar = new Tar();
  for await (
    const file of files
  ) {
    await tar.append(file, {
      filePath: file,
    });
  }
  const writer = await Deno.open(output, { write: true, create: true });
  await copy(tar.getReader(), writer);
  writer.close();
}

export function zip(files: string[], output: string) {
  const archive = archiver.default("zip", {
    zlib: { level: 9 },
  });
  for (const file of files) {
    archive.file(file, { name: file });
  }
  const outStream = createWriteStream(output);

  return new Promise((resolve, reject) => {
    archive.finalize();
    pipeline(archive, outStream, (err: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
