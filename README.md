# nzip

Intelligent fast compression | 智能化快速压缩

<br />

## Support

### cli

- nodejs Ignore node_modules and any cache | 忽略 nodejs 的 node_modules
  和常见缓存

### program

- Streaming zip | 流式 zip
- Multi-file synthesis | 多文件合成

<br />

## Usage

### install

```shell
deno install --allow-read --allow-write --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

Of course, if you don't have Deno installed | 当然如果你没装过 deno 👇

```shell
npx deno-npx install --allow-read --allow-write --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

### cli

#### zip

```shell
nzip # in your porject
```

#### tar

```shell
nzip -t tar # in your porject
```

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

## TODO

- Back pressure treatment

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).
