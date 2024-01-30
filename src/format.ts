import { Buffer, type Entry, iconv, jschardet } from "./deps.ts";

export function formatUnzipEntryFileName(
  entry: Entry,
  nameEncoding?: string,
) {
  const rawFileName = Buffer.from(entry.rawFilename);
  if (nameEncoding) {
    entry.filename = iconv.decode(rawFileName, nameEncoding);
    return;
  }
  const { encoding, confidence } = jschardet.detect(rawFileName);
  if (confidence > 0.9 && Buffer.isEncoding(encoding)) {
    entry.filename = rawFileName.toString(encoding);
    return;
  }
  entry.filename = iconv.decode(rawFileName, "gbk");
}
