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
    if (options?.ignore && options?.ignore(fileName)) {
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
  const paths: string[] = [];
  const options = useOptions();
  const dirs = new Set<string>();
  const zip = new AdmZip(file);
  const zipEntries: Entry[] = zip.getEntries();

  const promises = zipEntries.map(async (entry) => {
    formatEntryName(entry);
    const { entryName, isDirectory } = entry;
    if (options?.ignore(entryName)) {
      return;
    }
    const path = join(output, entryName);
    if (isDirectory) {
      return;
    }
    const dir = dirname(path);
    if (!dirs.has(dir)) {
      paths.push(dir);
      await ensureDir(dir);
    }
    await Deno.writeFile(path, entry.getData());
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

  function formatEntryName(entry: Entry) {
    if (options?.nameEncoding) {
      entry.entryName = iconv.decode(
        entry.rawEntryName,
        options.nameEncoding,
      );
      return;
    }
    const { encoding, confidence } = jschardet.detect(entry.rawEntryName);
    if (confidence > 0.9 && Buffer.isEncoding(encoding)) {
      entry.entryName = entry.rawEntryName.toString(encoding);
      return;
    }
    entry.entryName = iconv.decode(entry.rawEntryName, "gbk");
  }
}
