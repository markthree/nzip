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

export async function untar(file: string, output: string) {
  const reader = await Deno.open(file, { read: true });
  const untar = new Untar(reader);

  for await (const entry of untar) {
    const { fileName, type } = entry;
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

export function unzip(file: string, output: string, nameEncoding?: string) {
  const zip = new AdmZip(file);
  const zipEntries = zip.getEntries();
  for (let i = 0; i < zipEntries.length; i++) {
    const entry = zipEntries[i];
    if (nameEncoding) {
      entry.entryName = iconv.encode(entry.entryName, nameEncoding);
      continue;
    }
    const { encoding, confidence } = jschardet.detect(entry.rawEntryName);
    if (confidence > 0.9 && Buffer.isEncoding(encoding)) {
      entry.entryName = entry.rawEntryName.toString(encoding);
      continue;
    }
    entry.entryName = iconv.decode(
      entry.rawEntryName,
      "gbk",
    );
  }
  return zip.extractAllTo(output, true);
}
