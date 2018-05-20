const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'htom',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },
  externals: {
    htmlparser2: {
      commonjs: 'htmlparser2',
      commonjs2: 'htmlparser2',
      amd: 'htmlparser2',
      root: 'htmlparser2'
    }
  }
};
