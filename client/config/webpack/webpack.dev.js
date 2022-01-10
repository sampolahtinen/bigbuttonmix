const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { merge } = require('webpack-merge');
const commonWebpackConfig = require('./webpack.common');
const paths = require('../paths');

const PORT = 5000;

const webpackDevConfig = env => {
  return merge(commonWebpackConfig(env), {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin()
    ],
    devServer: {
      compress: true, // enable gzip compression
      hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin,
      historyApiFallback: true, // true for index.html upon 404, object for multiple paths
      port: PORT,
      static: {
        directory: paths.distPath,
        publicPath: '/',
        watch: true
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
        // logging: 'error'
      },
      onListening: function () {
        console.log('Listening on port:', PORT);
      }
    }
  });
};

module.exports = webpackDevConfig;
