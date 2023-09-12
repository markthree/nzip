export * from "./src/deps.ts";
export * from "./src/compress.ts";
export * from "./src/decompress.ts";
import { tar, zip } from "./src/compress.ts";
import {
  basename,
  Command,
  EnumType,
  exists,
  green,
  join,
  prettyBytes,
  relative,
  walk,
} from "./src/deps.ts";
import { version } from "./src/version.ts";

if (import.meta.main) {
  const types = new EnumType(["tar", "zip"]);

  const args = await new Command()
    .name("nzip")
    .version(version)
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
}

export async function mayBeExists(output: string) {
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

export async function walkFiles(dir: string) {
  const files: string[] = [];
  for await (
    const entry of walk(dir, {
      includeDirs: false,
      includeFiles: true,
      skip: [
        /(?<=[\\\/])(node_modules|temp|cache|dist|\.(nuxt|nitro|output))(?=[\\\/])/,
      ],
    })
  ) {
    files.push(relative(dir, entry.path));
  }
  return files;
}
