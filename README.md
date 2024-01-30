# nzip

Intelligent fast compression and decompression `cli`

## Support

### cli

- Support for `tar` and `unzip`
- Ignores common caching of `nodejs`
- Support for [c12](https://github.com/unjs/c12) configuration (name: nzip)

### program

- Multi-file bundling
- Support for `tar` and `unzip`

<br />

## Usage

### Program

```ts
import { tar, untar, unzip, zip } from "https://deno.land/x/nzip/mod.ts";

// Compression
await tar(["/path/file1", "/path/file2"], "output.tar");
await zip(["/path/file1", "/path/file2"], "output.zip");

// Decompression
await untar("output.tar", "/path2/");
await unzip("output.tar", "/path2/");
```

<br />

### cli

#### Installation

```shell
deno install --allow-read --allow-write --allow-env --allow-sys --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

Of course, if you haven't installed `deno` before 👇

```shell
npx deno-npx install --allow-read --allow-write --allow-env --allow-sys --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

#### Zip

```shell
nzip # # In your project
```

#### Tar

```shell
nzip -t tar # In your project
```

#### Configuration File

```ts
// nzip.config.ts
export default {
  // Name of the file after successful compression, default is 'default'
  name: "demo",
  // Custom rules to skip
  skip: [/script/],
};
```

```shell
nzip # Merges configuration automatically
```

#### Decompression

```shell
nzip de <your.zip|your.rar> <output>
```

<br />

## Refs

- `tar` is supported by the `deno` standard library
  [archive](https://deno.land/std/archive/mod.ts)
- `zip` is supported by
  [gildas-lormeau/zip.js](https://github.com/gildas-lormeau/zip.js), so it is
  particularly fast

<br />

## License

Made with [markthree](https://github.com/markthree) Published under
[MIT License](./LICENSE).
