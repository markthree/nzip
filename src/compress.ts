import { AdmZip, Buffer, copy, Tar } from "./deps.ts";

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

export async function zip(files: string[], output: string) {
  const zip = new AdmZip();

  const promises = files.map(async (file) => {
    const content = await Deno.readFile(file);
    zip.addFile(file, Buffer.from(content));
  });

  await Promise.all(promises);

  await zip.writeZipPromise(output);
}
