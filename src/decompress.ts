import { formatUnzipEntryFileName } from "./format.ts";
import {
  copy,
  ensureDir,
  ensureFile,
  type Entry,
  join,
  noop,
  pass,
  TarEntry,
  Untar,
  ZipReader,
} from "./deps.ts";

interface UntarOptions {
  ignore?: (entryName: string) => boolean;
  normalize?(entry: TarEntry[]): TarEntry[];
}

export async function untar(
  file: string,
  output: string,
  options?: UntarOptions,
): Promise<string[]> {
  const reader = await Deno.open(file, { read: true });
  const untar = new Untar(reader);
  const paths: string[] = [];
  let entrys = await Array.fromAsync(untar);
  if (options?.normalize) {
    entrys = options.normalize(entrys);
  }
  for (const entry of entrys) {
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

  normalize?(entry: Entry[]): Entry[];
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
  const {
    ignore = noop,
    useWebWorkers = false,
    nameEncoding,
    normalize = pass,
  } = options || {};

  const newEntrys = normalize(
    entrys.map((entry) => {
      formatUnzipEntryFileName(entry, nameEncoding);
      return entry;
    }),
  );

  const promises = newEntrys.map(async (entry) => {
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
