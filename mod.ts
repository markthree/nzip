export * from "./src/compress.ts";
export * from "./src/decompress.ts";
export * from "./src/config.ts";
import { tar, zip } from "./src/compress.ts";
import {
  Command,
  emptyDir,
  ensureDir,
  EnumType,
  exists,
  extname,
  green,
  join,
  prettyBytes,
  relative,
  walk,
} from "./src/deps.ts";
import { version } from "./src/version.ts";
import { untar, unzip } from "./src/decompress.ts";
import { defaultConfig } from "./src/config.ts";
import type { Config, ExternalSkip } from "./src/config.ts";

if (import.meta.main) {
  const types = new EnumType(["tar", "zip"]);

  const nzip = new Command()
    .name("nzip")
    .version(version)
    .type("type", types)
    .option("-t, --type <type:type>", "Set type.", {
      default: "zip" as const,
    })
    .option("-w, --withConfig <withConfig:boolean>", "With c12 config", {
      default: true,
    })
    .description("Intelligent fast compression | 智能化快速压缩")
    .action(async (options) => {
      const { cwd, output, externalSkip, type } = await loadOptions(options);

      await mayBeExists(output);
      const files = await walkFiles(cwd, externalSkip);

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
    });

  const decompress = new Command().description("decompress file to output")
    .alias("de")
    .alias("un")
    .arguments("<file:string> <output:string>")
    .action(async (_, file: string, output: string) => {
      if (!await exists(file, { isFile: true })) {
        throw new Deno.errors.NotFound("file does not exist");
      }

      if (await exists(output, { isDirectory: true })) {
        const clean = confirm(
          "😬 The output already exists. Do you want to force an update ?",
        );

        if (!clean) {
          Deno.exit(0);
        }
        await emptyDir(output);
      }
      await ensureDir(output);
      const ext = extname(file);
      if (ext === ".zip") {
        await unzip(file, output);
        return;
      }

      if (ext === ".rar") {
        await untar(file, output);
        return;
      }

      throw new Deno.errors.NotSupported(
        "nzip decompression only supports. zip and. rar files",
      );
    });

  nzip.command("decompress", decompress);

  nzip.parse(Deno.args);
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

export async function walkFiles(
  dir: string,
  externalskip?: ExternalSkip,
) {
  const files: string[] = [];

  const skip = externalskip?.map((s) =>
    typeof s === "string" ? new RegExp(s) : s
  );

  for await (
    const entry of walk(dir, {
      skip,
      includeDirs: false,
      includeFiles: true,
      followSymlinks: true,
      includeSymlinks: true,
    })
  ) {
    files.push(relative(dir, entry.path));
  }
  return files;
}

export async function loadConfig() {
  const { loadConfig: _loadConfig } = await import("npm:c12@1.5.1");
  const { config } = await _loadConfig<Config>({
    name: "nzip",
    packageJson: true,
    defaultConfig,
  });

  if (config?.withDefaultSkip === false) {
    defaultConfig.skip.forEach((s) => {
      config.skip = config.skip?.filter((cs) => cs !== s);
    });
  }
  return config;
}

interface Options {
  withConfig: boolean;
  type: "zip" | "tar";
}

export async function loadOptions(options: Options) {
  const cwd = Deno.cwd();

  if (options.withConfig) {
    const config = await loadConfig();
    const name = config?.name;
    const output = `${name}.${options.type}`;
    const externalSkip = config?.skip ?? [];
    return {
      cwd,
      output,
      externalSkip,
      type: options.type,
    };
  }
  return {
    cwd,
    type: options.type,
    output: `${defaultConfig.name}.${options.type}`,
  };
}
