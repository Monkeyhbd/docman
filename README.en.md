# DocMan - Docs Website Build System Based on Node.js

DocMan is a documentation website build system based on Node.js, allow you publish your markdown document project (docs, tutorial, notes, etc.) as html website that users can read in a broswer.

## Links / Contribute

- Our website: [DocMan Docs](https://docman.monkeyhbd.com)
- DocMan Core (this project): [GitHub](https://github.com/monkeyhbd/docman) | [Gitee](https://gitee.com/monkeyhbd/docman) | [NPM](https://www.npmjs.com/package/docman-core)
- DocMan CLI: [GitHub](https://github.com/monkeyhbd/docman-cli) | [Gitee](https://gitee.com/monkeyhbd/docman-cli) | [NPM](https://www.npmjs.com/package/docman-cli)

## Quick Start

Install DocMan CLI.

```shell
$ npm install docman-cli -g
$ docman --help
```

Create a DocMan instance.

```shell
$ docman create hello-world
```

Enter DocMan instance, install dependencies, then start build.

```shell
$ cd hello-world
$ npm install
$ npm run build
```

The builded html website will output to `dist` sub directory in DocMan instance, now you can publish it by a web server.
