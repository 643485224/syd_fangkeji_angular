/*
 * The webpack config exports an object that has a valid webpack configuration
 * For each environment name. By default, there are two Ionic environments:
 * "dev" and "prod". As such, the webpack.config.js exports a dictionary object
 * with "keys" for "dev" and "prod", where the value is a valid webpack configuration
 * For details on configuring webpack, see their documentation here
 * https://webpack.js.org/configuration/
 */

var webpack = require('webpack');
var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
var ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
var PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

if (useDefaultConfig.dev.plugins) {
  useDefaultConfig.dev.plugins.push(new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
    result.request = result.request.replace(/typeorm/, "typeorm/browser");
  }));

  /*
  useDefaultConfig.dev.plugins.push(new webpack.ProvidePlugin({
    'window.SQL': 'sql.js/js/sql.js'
  }));
  */

  useDefaultConfig.dev.plugins.push(new webpack.DefinePlugin({
    IS_DEV_MODE: true,
    TYPEORM_VERSION: JSON.stringify(require("typeorm/package.json").version),
    APP_SCRIPTS_VERSION: JSON.stringify(require("@ionic/app-scripts/package.json").version),
    IONIC_VERSION: JSON.stringify(require("ionic-angular/package.json").version),
    BUILD_TIME: JSON.stringify(new Date().toString()),
  }));
}

if (useDefaultConfig.prod.plugins) {
  useDefaultConfig.prod.plugins.push(new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
    result.request = result.request.replace(/typeorm/, "typeorm/browser");
  }));

  useDefaultConfig.prod.plugins.push(new webpack.DefinePlugin({
    IS_DEV_MODE: false,
    TYPEORM_VERSION: JSON.stringify(require("typeorm/package.json").version),
    APP_SCRIPTS_VERSION: JSON.stringify(require("@ionic/app-scripts/package.json").version),
    IONIC_VERSION: JSON.stringify(require("ionic-angular/package.json").version),
    BUILD_TIME: JSON.stringify(new Date().toString()),
  }));
}

module.exports = function () {
  return useDefaultConfig;
};
