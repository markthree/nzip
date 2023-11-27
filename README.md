# nzip

Intelligent fast compression | 智能化快速压缩

<br />

## Support

### cli

- Supports [c12](https://github.com/unjs/c12) configuration | 支持 [c12](https://github.com/unjs/c12) 配置 (name: nzip)
- nodejs Ignore node_modules and any cache | 忽略 nodejs 的 node_modules
  和常见缓存

### program

- Streaming zip | 流式 zip
- Multi-file synthesis | 多文件合成

<br />

## Usage

### program

```ts
import { tar, untar, unzip, zip } from "https://deno.land/x/nzip/mod.ts"

// compress 压缩
await tar(["/path/file1", "/path/file2"], "output.tar")
await zip(["/path/file1", "/path/file2"], "output.zip")

// decompress 解压
await untar("output.tar", "/path2/")
await unzip("output.tar", "/path2/")
```

<br />

### cli

#### install

```shell
deno install --allow-read --allow-write --allow-env --allow-sys --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

Of course, if you don't have Deno installed | 当然如果你没装过 deno 👇

```shell
npx deno-npx install --allow-read --allow-write --allow-env --allow-sys --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

#### zip

```shell
nzip # in your porject
```

#### tar

```shell
nzip -t tar # in your porject
```

#### withConfig

```ts
// nzip.config.ts
export default {
  // Your custom skip
  skip: [/script/],
}
```

```shell
nzip # Automatically merge configurations
```

#### decompress

```shell
nzip de your.zip outputDir
```

<br />

## TODO

- Back pressure treatment

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).
