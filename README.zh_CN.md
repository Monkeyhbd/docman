# DocMan - Node.js 文档站点构造系统

DocMan 是一款基于 Node.js 的文档站点构造系统，允许您将由 Markdown 编写的文档项目（文档、教程、笔记等等）出版为可以在浏览器中给用户阅读的 HTML 文档站点。

## 相关链接 / 参与贡献

- 官方文档：[DocMan Docs](https://docman.monkeyhbd.com)
- DocMan Core（本项目）：[GitHub](https://github.com/monkeyhbd/docman) | [Gitee](https://gitee.com/monkeyhbd/docman) | [NPM](https://www.npmjs.com/package/docman-core)
- DocMan CLI：[GitHub](https://github.com/monkeyhbd/docman-cli) | [Gitee](https://gitee.com/monkeyhbd/docman-cli) | [NPM](https://www.npmjs.com/package/docman-cli)

## 快速开始

安装 DocMan CLI ：

```shell
$ npm install docman-cli -g
$ docman --help
```

创建 DocMan 实例：

```shell
$ docman create hello-world
```

进入 DocMan 实例，安装 NPM 依赖，然后开始构建：

```shell
$ cd hello-world
$ npm install
$ npm run build
```

构造得到的 HTML 站点文件将会输出至 DocMan 实例的 `dist` 目录下，您可以使用 Web 服务器进行发布。
