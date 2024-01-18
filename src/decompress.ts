import {
  AdmZip,
  Buffer,
  copy,
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
) {
  const reader = await Deno.open(file, { read: true });
  const untar = new Untar(reader);

  for await (const entry of untar) {
    const { fileName, type } = entry;
    if (options?.ignore && options.ignore(fileName)) {
      continue;
    }
    const path = join(output, fileName);
    if (type === "directory") {
      await ensureDir(path);
      continue;
    }

    await ensureFile(path);
    const file = await Deno.open(path, { write: true });
    await copy(entry, file);
  }
  reader.close();
}

interface UnzipOptions {
  nameEncoding?: string;
  ignore: (entryName: string) => boolean;
}

interface Entry {
  entryName: string;
  rawEntryName: Buffer;
}

export function unzip(
  file: string,
  output: string,
  nameEncoding?: string,
): undefined;
export function unzip(
  file: string,
  output: string,
  options?: UnzipOptions,
): undefined;
export function unzip(
  file: string,
  output: string,
  nameEncodingOrOptions?: string | UnzipOptions,
) {
  const options = useOptions();
  const zip = new AdmZip(file);
  const zipEntries: Entry[] = zip.getEntries();

  formatEntryNames();

  if (options?.ignore) {
    const entrys = zipEntries.filter((entry) =>
      options.ignore(entry.entryName)
    );
    entrys.forEach((entry) => deleteFile(entry.entryName));
  }

  return zip.extractAllTo(output, true);

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

  function deleteFile(entryName: string) {
    const index = zipEntries.findIndex((entry) =>
      entry.entryName === entryName
    );
    if (index !== -1) {
      zipEntries.splice(index, 1);
    }
  }
}
