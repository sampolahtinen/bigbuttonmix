const { merge } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const common = require('./webpack.common');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const paths = require('../paths');

require('dotenv').config();

const webpackProdConfig = env => {
  return merge(common(env), {
    mode: 'production',
    output: {
      filename: 'js/[name].[contenthash].bundle.js',
      path: paths.distPath,
      publicPath: '/'
    },
    stats: 'normal',
    plugins: [
      env.analyze && new BundleAnalyzerPlugin(),
      env.production &&
        new webpack.DefinePlugin({
          'process.env': {
            MAPBOX_TOKEN: JSON.stringify(process.env.MAPBOX_TOKEN)
          }
        })
    ].filter(Boolean),
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1
      },
      runtimeChunk: {
        name: 'runtime'
      }
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  });
};

module.exports = webpackProdConfig;
