import { walk } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { Tar } from "https://deno.land/std@0.182.0/archive/tar.ts";
import { copy } from "https://deno.land/std@0.182.0/streams/copy.ts";
import type { WalkOptions } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { basename, relative } from "https://deno.land/std@0.182.0/path/mod.ts";

const cwd = Deno.cwd();
const base = basename(cwd) ?? "default";
const output = `${base}.tar`;

const tar = new Tar();
const walkOptions: WalkOptions = {
  skip: [/node_modules|temp|cache|dist|\.(nuxt|output)/],
  includeDirs: false,
};

for await (
  const entry of walk(cwd, walkOptions)
) {
  const { path } = entry;
  const normalizedPath = relative(cwd, path);
  await tar.append(normalizedPath, {
    filePath: normalizedPath,
  });
}

const writer = await Deno.open(output, { write: true, create: true });
await copy(tar.getReader(), writer);
writer.close();
