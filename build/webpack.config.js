const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry : path.join(__dirname, '../src/index.js'),
  output : {
    path : path.join(__dirname, '../dist'),
    filename : 'client-orm.js',
    libraryTarget : 'commonjs-module'
  },
  module : {
    rules : [
      {
        test : /\.js$/,
        loader : 'babel-loader',
        exclude : /node_modules/
      }
    ]
  },
  externals : ['jpex', 'jpex-defaults']
};
