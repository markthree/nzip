import {
  copy,
  createReadStream,
  createWriteStream,
  fflate,
  noop,
  pipeline,
  Readable,
  Tar,
} from "./deps.ts"

export async function tar(files: string[], output: string) {
  const tar = new Tar()
  for await (
    const file of files
  ) {
    await tar.append(file, {
      filePath: file,
    })
  }
  const writer = await Deno.open(output, { write: true, create: true })
  await copy(tar.getReader(), writer)
  writer.close()
}

export function zip(files: string[], output: string) {
  const outStream = createWriteStream(output)
  const zipStream = createZipReadStream(files)
  return new Promise((resolve, reject) => {
    pipeline(zipStream, outStream, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(undefined)
      }
    })
  })
}

export function createZipDeflate(path: string) {
  const srcStream = createReadStream(path)
  const zipDeflate = new fflate.ZipDeflate(path)

  srcStream.on("data", (chunk: Uint8Array) => {
    zipDeflate.push(chunk, true)
  })

  srcStream.on("end", () => {
    zipDeflate.push(new Uint8Array(0), true)
  })

  return zipDeflate
}

export function createZipReadStream(files: string[]) {
  let push: (dat: Uint8Array | null) => void = noop
  const stream = new Readable({
    read() {
      push = this.push.bind(this)
    },
  })
  const _zip = new fflate.Zip((err, dat, final) => {
    if (err) {
      throw err
    }
    if (dat.length) {
      push(dat)
    }
    if (final) {
      push(null)
    }
  })
  files.forEach((file) => _zip.add(createZipDeflate(file)))
  _zip.end()
  return stream
}
