import { join } from "https://deno.land/std@0.182.0/path/mod.ts";
import { Tar } from "https://deno.land/std@0.182.0/archive/tar.ts";
import { copy } from "https://deno.land/std@0.182.0/streams/copy.ts";
import { exists, walk } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { cyan, green } from "https://deno.land/std@0.182.0/fmt/colors.ts";
import type { WalkOptions } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { prettyBytes } from "https://deno.land/x/pretty_bytes@v2.0.0/mod.ts";
import { basename, relative } from "https://deno.land/std@0.182.0/path/mod.ts";

const { cwd, output, suffix } = usePath();
const { createTarFile, walkTar } = useTar();

await mayBeForceUpdate(output);

const {
  entrysSize,
  entrysTotal,
} = await walkTar(cwd);

await createTarFile(output);

const { size: outoutSize } = await Deno.lstat(output);

console.log(`
type - ${green(suffix)}
total - ${entrysTotal} 
size - ${prettyBytes(entrysSize)} -> ${prettyBytes(outoutSize)}
output - ${cyan(join(cwd, output))}
`);

function useTar() {
  const tar = new Tar();
  function appendTar(path: string) {
    return tar.append(path, {
      filePath: path,
    });
  }
  async function createTarFile(output: string) {
    const writer = await Deno.open(output, { write: true, create: true });
    await copy(tar.getReader(), writer);
    writer.close();
  }

  async function walkTar(cwd: string) {
    const walkOptions: WalkOptions = {
      skip: [/node_modules|temp|cache|dist|\.(nuxt|output)/],
      includeDirs: false,
    };

    let entrysTotal = 0;
    let entrysSize = 0;
    for await (
      const entry of walk(cwd, walkOptions)
    ) {
      const { path } = entry;
      entrysTotal++;
      await appendTar(relative(cwd, path));
      const { size } = await Deno.lstat(path);
      entrysSize += size;
    }
    return {
      entrysTotal,
      entrysSize,
    };
  }

  return {
    walkTar,
    appendTar,
    createTarFile,
  };
}

function usePath() {
  const suffix = `tar`;
  const cwd = Deno.cwd();
  const base = basename(cwd) ?? "default";
  const output = `${base}.${suffix}`;
  return {
    cwd,
    base,
    suffix,
    output,
  };
}

async function mayBeForceUpdate(output: string) {
  if (await exists(output)) {
    const foreceUpdate = confirm(
      "😬 The file already exists. Do you want to force an update ?",
    );
    if (foreceUpdate) {
      await Deno.remove(output);
    } else {
      Deno.exit(0);
    }
  }
}
