export {
  Tar,
  TarEntry,
  Untar,
} from "https://deno.land/std@0.208.0/archive/mod.ts";
export { copy } from "https://deno.land/std@0.208.0/streams/copy.ts";
export { green } from "https://deno.land/std@0.208.0/fmt/colors.ts";
export {
  emptyDir,
  ensureDir,
  ensureFile,
  exists,
  walk,
} from "https://deno.land/std@0.208.0/fs/mod.ts";
export { format as prettyBytes } from "https://deno.land/std@0.208.0/fmt/bytes.ts";
export {
  basename,
  dirname,
  extname,
  join,
  relative,
} from "https://deno.land/std@0.208.0/path/mod.ts";
export {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";

export { default as iconv } from "npm:iconv-lite@0.6.3";
export { default as jschardet } from "npm:jschardet@3.0.0";
export { Buffer } from "node:buffer";

export {
  ZipReader,
  ZipWriter,
} from "https://deno.land/x/zipjs@v2.7.34/index.js";
export type { Entry } from "https://deno.land/x/zipjs@v2.7.34/index.d.ts";
export { noop } from "https://deno.land/x/easy_std@v0.8.0/src/fn.ts";
export { slash } from "https://deno.land/x/easy_std@v0.8.0/src/path.ts";

export function pass<T>(r: T) {
  return r;
}
