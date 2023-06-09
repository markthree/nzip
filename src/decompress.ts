import { copy, ensureDir, ensureFile, join, Untar, AdmZip } from "./deps.ts"

export async function untar(file: string, output: string) {
  const reader = await Deno.open(file, { read: true })
  const untar = new Untar(reader)

  for await (const entry of untar) {
    const { fileName, type } = entry
    const path = join(output, fileName)
    if (type === "directory") {
      await ensureDir(path)
      continue
    }

    await ensureFile(path)
    const file = await Deno.open(path, { write: true })
    await copy(entry, file)
  }
  reader.close()
}

export function unzip(file: string, output: string, nameEncoding = 'GBK') {
  const zip = new AdmZip(file, nameEncoding)
  return zip.extractAllTo(output, true)
}
