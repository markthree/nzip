# nzip

智能化快速解压和压缩 `cli`

## 支持

### cli

- 支持 `tar` 和 `unzip`
- 忽略 `nodejs` 的常见的缓存
- 支持 [c12](https://github.com/unjs/c12) 配置 (name: nzip)

### program

- 多文件合成
- 支持 `tar` 和 `unzip`

<br />

## 使用

### 程序

```ts
import { tar, untar, unzip, zip } from "https://deno.land/x/nzip/mod.ts";

// 压缩
await tar(["/path/file1", "/path/file2"], "output.tar");
await zip(["/path/file1", "/path/file2"], "output.zip");

// 解压
await untar("output.tar", "/path2/");
await unzip("output.tar", "/path2/");
```

<br />

### cli

#### 安装

```shell
deno install --allow-read --allow-write --allow-env --allow-sys --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

当然如果你没装过 `deno` 👇

```shell
npx deno-npx install --allow-read --allow-write --allow-env --allow-sys --allow-run -rfn nzip https://deno.land/x/nzip/mod.ts
```

#### zip

```shell
nzip # # 在你的项目中
```

#### tar

```shell
nzip -t tar # 在你的项目中
```

#### 配置文件

```ts
// nzip.config.ts
export default {
  // 压缩成功后的名称，默认为 default
  name: "demo",
  // 自定义跳过的规则
  skip: [/script/],
};
```

```shell
nzip # 自动合并配置
```

#### 解压

```shell
nzip de <your.zip|your.rar> <output>
```

<br />

## refs

- `tar` 由 `deno` 标准库 [archive](https://deno.land/std/archive/mod.ts)
  提供支持
- `zip` 由 [gildas-lormeau/zip.js](https://github.com/gildas-lormeau/zip.js)
  提供支持，所以速度特别快

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).
