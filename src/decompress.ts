import {
  AdmZip,
  Buffer,
  copy,
  dirname,
  ensureDir,
  ensureFile,
  iconv,
  join,
  jschardet,
  Untar,
  withResolvers,
} from "./deps.ts";

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
    if (options?.ignore && options.ignore(fileName)) {
      continue;
    }
    const path = join(output, fileName);
    if (type === "directory") {
      await ensureDir(path);
      paths.push(path);
      continue;
    }
    await ensureFile(path);
    paths.push(path);
    const file = await Deno.open(path, { write: true });
    await copy(entry, file);
  }
  reader.close();
  return paths;
}

interface UnzipOptions {
  nameEncoding?: string;
  ignore: (entryName: string) => boolean;
}

interface Entry {
  entryName: string;
  rawEntryName: Buffer;
  isDirectory: boolean;
  getData(): Buffer;
  getDataAsync(resolve: (data: Buffer) => void): void;
}

export function unzip(
  file: string,
  output: string,
  nameEncoding?: string,
): Promise<string[]>;
export function unzip(
  file: string,
  output: string,
  options?: UnzipOptions,
): Promise<string[]>;
export async function unzip(
  file: string,
  output: string,
  nameEncodingOrOptions?: string | UnzipOptions,
): Promise<string[]> {
  const options = useOptions();
  const zip = new AdmZip(file);
  const zipEntries: Entry[] = zip.getEntries();

  formatEntryNames();
  const dirs = new Set<string>();
  const paths: string[] = [];
  const promises = zipEntries.map(async (entry) => {
    if (options?.ignore(entry.entryName)) {
      return;
    }
    const path = join(output, entry.entryName);
    if (entry.isDirectory) {
      paths.push(path);
      return;
    }
    const dir = dirname(path);
    if (!dirs.has(dir)) {
      await ensureDir(dir);
    }
    const { promise, resolve } = withResolvers<Buffer>();
    entry.getDataAsync(resolve);
    await Deno.writeFile(path, await promise);
    paths.push(path);
  });

  await Promise.all(promises);

  return paths;

  function useOptions() {
    let nameEncoding: string | undefined;
    if (typeof nameEncodingOrOptions === "string") {
      nameEncoding = nameEncodingOrOptions;
      return {
        nameEncoding,
      } as UnzipOptions;
    }
    return nameEncodingOrOptions;
  }

  function formatEntryNames() {
    for (let i = 0; i < zipEntries.length; i++) {
      const entry = zipEntries[i];
      if (options?.nameEncoding) {
        entry.entryName = iconv.decode(
          entry.rawEntryName,
          options.nameEncoding,
        );
        continue;
      }
      const { encoding, confidence } = jschardet.detect(entry.rawEntryName);
      if (confidence > 0.9 && Buffer.isEncoding(encoding)) {
        entry.entryName = entry.rawEntryName.toString(encoding);
        continue;
      }
      entry.entryName = iconv.decode(entry.rawEntryName, "gbk");
    }
  }
}
