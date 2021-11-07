const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  srcPath: resolveApp('src'),
  publicPath: resolveApp('public'),
  appHtml: resolveApp('public/template.html'),
  distPath: resolveApp('dist'),
  entryPath: resolveApp('src/index.tsx'),
  assetsPath: resolveApp('src/assets')
};
