import { ensureFile } from "./deps.ts";
import { copy, ensureDir, join, noop, Untar, ZipReader } from "./deps.ts";
import { formatUnzipEntryFileName } from "./format.ts";

interface UntarOptions {
  ignore?: (entryName: string) => boolean;
}

export async function untar(
  file: string,
  output: string,
  options?: UntarOptions,
): Promise<string[]> {
  const reader = await Deno.open(file, { read: true });
  const untar = new Untar(reader);
  const paths: string[] = [];
  for await (const entry of untar) {
    const { fileName, type } = entry;
    if (options?.ignore && options?.ignore(fileName)) {
      continue;
    }
    const path = join(output, fileName);
    if (type === "directory") {
      await ensureDir(path);
      paths.push(path);
      continue;
    }
    paths.push(path);
    await ensureFile(path);
    const file = await Deno.open(path, { write: true });
    await copy(entry, file);
  }
  reader.close();
  return paths;
}

interface UnzipOptions {
  ignore?: (entryName: string) => boolean;
  /**
   * @default false
   */
  useWebWorkers?: boolean;
  nameEncoding?: string;
}

export async function unzip(
  file: string,
  output: string,
  options?: UnzipOptions,
) {
  using fd = await Deno.open(file);
  const zipReader = new ZipReader(fd);
  const entrys = await zipReader.getEntries();
  const paths: string[] = [];
  const { ignore = noop, useWebWorkers = false, nameEncoding } = options || {};
  const promises = entrys.map(async (entry) => {
    formatUnzipEntryFileName(entry, nameEncoding);
    if (ignore(entry.filename)) {
      return;
    }
    const path = join(output, entry.filename);
    paths.push(path);
    if (entry.directory) {
      await ensureDir(path);
      return;
    }
    if (!entry.getData) {
      return;
    }
    await ensureFile(path);
    using fd = await Deno.open(path, { write: true });
    await entry?.getData(fd, {
      useWebWorkers,
    });
  });
  await Promise.all(promises);
  await zipReader.close();
  return paths;
}
