import { tar, zip } from "./src/compress.ts";
import { join } from "https://deno.land/std@0.182.0/path/mod.ts";
import { green } from "https://deno.land/std@0.182.0/fmt/colors.ts";
import { exists, walk } from "https://deno.land/std@0.182.0/fs/mod.ts";
import { prettyBytes } from "https://deno.land/x/pretty_bytes@v2.0.0/mod.ts";
import { basename, relative } from "https://deno.land/std@0.182.0/path/mod.ts";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

const types = new EnumType(["tar", "zip"]);

const args = await new Command()
  .name("nzip")
  .version("0.0.2")
  .type("type", types)
  .option("-t, --type <type:type>", "Set type.", {
    default: "zip" as const,
  })
  .description("Intelligent fast compression | 智能化快速压缩")
  .parse(Deno.args);

// constant
const { type } = args.options;
const suffix = type;
const cwd = Deno.cwd();
const base = basename(cwd) ?? "default";
const output = `${base}.${suffix}`;

await mayBeExists(output);

const files = await walkFiles(cwd);

if (type === "zip") {
  await zip(files, output);
} else {
  await tar(files, output);
}

const { size: outoutSize } = await Deno.lstat(output);

console.log(`
type - ${green(type)}
size - ${green(prettyBytes(outoutSize))}
output - ${green(join(cwd, output))}
`);

async function mayBeExists(output: string) {
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

async function walkFiles(dir: string) {
  const files: string[] = [];
  for await (
    const entry of walk(dir, {
      skip: [/node_modules|temp|cache|dist|\.(nuxt|output)/],
      includeDirs: false,
    })
  ) {
    files.push(relative(cwd, entry.path));
  }
  return files;
}
