const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

console.log(process.env.TEST);

const chalk = require('chalk');
const paths = require('../paths');

const webpackConfig = env => {
  console.log(chalk.yellow('ENV:'));
  console.table(env);

  return {
    entry: paths.entryPath,
    output: {
      path: paths.distPath,
      filename: '[name].bundle.js',
      assetModuleFilename: 'assets/[name][ext]'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)?$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx', // Or 'ts' if you don't need tsx
            target: 'es2015'
          },
          exclude: /node_modules/
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          type: 'asset/resource'
        },
        {
          test: /\.svg$/,
          use: '@svgr/webpack'
        },
        {
          test: /\.(jpg|jpeg|png|webp|avif)$/i,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      env.development && new DotenvPlugin({ path: '../.env' }),
      new HtmlWebpackPlugin({
        template: paths.appHtml,
        filename: 'index.html',
        title: 'React Starter',
        og: {
          title: 'React Starter',
          description: 'React Starter'
        },
        meta: {
          description: 'React Starter'
        }
      }),
      new CleanWebpackPlugin(),
      new NodePolyfillPlugin(),
      new GenerateSW()
    ].filter(Boolean),
    resolve: {
      alias: {
        '@styles': path.resolve(__dirname, '../src/scss'),
        '@icons': path.resolve(__dirname, '../src/assets/icons')
      },
      modules: ['node_modules', paths.srcPath],
      fallback: {
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        util: false,
        assert: false
      },
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx']
    },
    target: 'web',
    performance: {
      hints: 'warning', // enum
      maxAssetSize: 200000, // int (in bytes),
      maxEntrypointSize: 400000 // int (in bytes)
    }
  };
};

module.exports = webpackConfig;
