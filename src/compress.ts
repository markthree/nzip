import { copy, ensureFile, slash, Tar, ZipWriter } from "./deps.ts";

export async function tar(files: string[], output: string) {
  const tar = new Tar();
  for await (
    const file of files
  ) {
    await tar.append(file, {
      filePath: slash(file),
    });
  }
  await ensureFile(output);
  const writer = await Deno.open(output, { write: true });
  await copy(tar.getReader(), writer);
  writer.close();
}

interface ZipOptions {
  /**
   * @default false
   */
  useWebWorkers?: boolean;
}

export async function zip(
  files: string[],
  output: string,
  options?: ZipOptions,
) {
  await ensureFile(output);
  using fd = await Deno.open(output, { write: true });
  const zipWriter = new ZipWriter(fd);
  const { useWebWorkers = false } = options || {};
  const promises = files.map(async (file) => {
    using fd = await Deno.open(file, { read: true });
    await zipWriter.add(slash(file), fd, {
      useWebWorkers,
    });
  });

  await Promise.all(promises);

  await zipWriter.close();
}
