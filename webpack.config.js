const { resolve } = require('path');

module.exports = {

  entry: {
    'core': './dist/index.js'
  },

  output: {
    filename: '[name].js',
    path: resolve('dist/bundles'),
    library: '@frampton/core',
    libraryTarget: 'commonjs2'
  },

  resolve: {
    extensions: [ '.js' ]
  }
};
