'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// 应用程序根目录
const publicPath = '/';
// 就是index.html中的%PUBLIC_URL%变量
const publicUrl = '';
// 获取环境变量以注入我们的应用程序。
const env = getClientEnvironment(publicUrl);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // 此选项控制是否以及如何生成 source map。
  devtool: 'cheap-module-source-map',
  entry: [
    // 默认的polyfills设置
    require.resolve('./polyfills'),
    // 更改了文件后自动刷新
    require.resolve('react-dev-utils/webpackHotDevClient'),
    // 我们最后包含应用程序代码，以便在初始化期间如果发生运行时错误，它不会炸毁WebpackDevServer客户端，并且更改JS代码仍然会触发刷新。
    paths.appIndexJs,
  ],
  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  // 这些选项能设置模块如何被解析。
  resolve: {
    // 告诉 webpack 解析模块时应该搜索的目录
    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.web.ts', '.ts', '.web.tsx', '.tsx', '.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
    },
    plugins: [
      // 差不多就是不能让js代码放在src和node_modules以外的地方
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      // 加载位于tsconfig.json的路径部分中指定位置的模块
      new TsconfigPathsPlugin({ configFile: paths.appTsConfig }),
    ],
  },
  module: {
    strictExportPresence: true,
    rules: [
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appSrc,
      },
      {
        // “oneOf”将遍历所有后续装载机，直到满足要求。 当没有加载器匹配时，它将回退到加载器列表末尾的“文件”加载器。
        oneOf: [
          // url-loader 功能类似于 file-loader，但是在文件大小（单位 byte）低于指定的限制时，可以返回一个 base64 的 DataURL。
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // babel-loader 用来转换js代码
          {
            test: /\.(js|jsx|mjs)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              // 在./node_modules/.cache/babel-loader/目录中启用缓存结果以加快重建。
              cacheDirectory: true,
              plugins: [
                ['import', [{ libraryName: "antd", style: 'css' }]],
              ],
            },
          },

          // 支持tsx
          {
            test: /\.(ts|tsx)$/,
            include: paths.appSrc,
            use: [
              {
                loader: require.resolve('babel-loader'),
              },
              {
                loader: require.resolve('ts-loader'),
                options: {
                  // disable type checker - we will use it in fork plugin
                  transpileOnly: true,
                },
              },
            ],
          },
          {
            test: /\.(css|less)$/,
            use: [
              // style-loader 会将 css-loader 解析出来的css通过<style>标签注入到html页面
              require.resolve('style-loader'),
              {
                // 可以吧css文件import到js文件中
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                },
              },
              // {
              //   loader: require.resolve('px2rem-loader'),
              //   options: {
              //     remUnit: 75 / 2,
              //     remPrecision: 8
              //   }
              // },
              // postcss-loader 用于添加各个浏览器的前缀
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
              {
                loader: require.resolve('less-loader'), // compiles Less to CSS
              },
            ],
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ],
  },
  plugins: [
    // 让index.html也支持%PUBLIC_URL%这种变量，在开发中，这将是一个空字符串。
    // env = { raw: { NODE_ENV: 'development', PUBLIC_URL: '' }, stringified: { 'process.env': { NODE_ENV: '"development"', PUBLIC_URL: '""' } } }
    new InterpolateHtmlPlugin(env.raw),
    // 创建打包后的index.html
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    // DefinePlugin 允许创建一个在编译时可以配置的全局常量。这可能会对开发模式和发布模式的构建允许不同的行为非常有用。(可以使用env环境变量)
    new webpack.DefinePlugin(env.stringified),
    // 模块热替换插件
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // 如果你需要一个丢失的模块，然后`npm install`，你仍然需要重新启动Webpack的开发服务器来发现它。 这个插件使发现自动化，所以你不必重新启动。
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // moment 2.18 会将所有本地化内容和核心功能一起打包。你可使用 IgnorePlugin 在打包时忽略本地化内容
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // 在单独的进程中执行类型检查和linting以加快编译速度
    // new ForkTsCheckerWebpackPlugin({
    //   async: false,
    //   watch: paths.appSrc,
    //   tsconfig: paths.appTsConfig,
    //   tslint: paths.appTsLint,
    // }),
  ],
  // externals 防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)。
  externals: {
    'tthg-jssdk': "ttHigo",
  },
  // 导入某些Node库模块，但不在浏览器中使用它们。 告诉Webpack为他们提供空模拟，以便导入它们。
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  // 关闭性能提示
  performance: {
    hints: false,
  },
};
