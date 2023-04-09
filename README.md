# nzip

Intelligent fast compression | 智能化快速压缩

<br />

## Support

### cli

- nodejs Ignore node_modules and any cache | 忽略 nodejs 的 node_modules 和常见缓存

### program

- Streaming zip | 流式 zip
- Multi-file synthesis | 多文件合成

<br />

## Usage

### install

```shell
deno install --allow-read --allow-write --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
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
import { tar, zip } from "https://deno.land/x/nzip/mod.ts"

await tar(['/path/file1', '/path/file2'], 'output.tar')
await zip(['/path/file1', '/path/file2'], 'output.zip')
```

<br />

## TODO

- Back pressure treatment


<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).