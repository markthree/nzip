import { join } from "https://deno.land/std@0.182.0/path/mod.ts";
import { Tar } from "https://deno.land/std@0.182.0/archive/tar.ts";
import { copy } from "https://deno.land/std@0.182.0/streams/copy.ts";
import { exists, walk } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { cyan, green } from "https://deno.land/std@0.182.0/fmt/colors.ts";
import type { WalkOptions } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { prettyBytes } from "https://deno.land/x/pretty_bytes@v2.0.0/mod.ts";
import { basename, relative } from "https://deno.land/std@0.182.0/path/mod.ts";

const cwd = Deno.cwd();
const base = basename(cwd) ?? "default";
const suffix = `tar`;
const output = `${base}.${suffix}`;

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

const tar = new Tar();
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
  const normalizedPath = relative(cwd, path);
  await tar.append(normalizedPath, {
    filePath: normalizedPath,
  });

  const { size } = await Deno.lstat(path);
  entrysSize += size;
}

const writer = await Deno.open(output, { write: true, create: true });
await copy(tar.getReader(), writer);
writer.close();

const { size: outoutSize } = await Deno.lstat(output);

console.log(`
type - ${green(suffix)}
total - ${entrysTotal} 
size - ${prettyBytes(entrysSize)} -> ${prettyBytes(outoutSize)}
output - ${cyan(join(cwd, output))}
`);
