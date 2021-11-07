const path = require('path');
const paths = require('../paths');

const createHtmlWebpackConfig = () => ({
  htmlConfigs: {
    template: path.join(paths.publicPath, 'index.html'),
    title: 'React Starter',
    og: {
      title: 'React Starter',
      description: 'React Starter',
      image: 'http://localhost:3000/assets/favicons/favicon-48x48.png'
    },
    meta: {
      description: 'React Starter'
    }
  }
  // faviconConfigs: {
  //   logo: path.join(paths.assetsPath, `${clientName}/img/logo-black.svg`),
  //   mode: 'webapp',
  //   devMode: 'webapp',
  //   cache: true,
  //   prefix: 'assets/favicons/',
  //   inject: true,
  //   favicons: {
  //     appName: 'React Starter',
  //     appDescription: 'React Starter',
  //     start_url: '/',
  //     display: 'browser',
  //     background: '#fff',
  //     icons: {
  //       coast: false,
  //       yandex: false,
  //       appleStartup: false
  //     }
  //   }
  // }
});

module.exports = createHtmlWebpackConfig;
