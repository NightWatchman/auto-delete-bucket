const path = require('path')


module.exports = function() {
  return {
    entry: './src/lambda/index.js',
    output: {
      path: path.resolve(__dirname, './dist/src/lambda'),
      libraryTarget: 'commonjs2',
      filename: 'index.js'
    },
    stats: 'minimal',
    target: 'node',
    devtool: 'sourcemap',
    externals: {
      'aws-sdk': 'aws-sdk'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        }
      ]
    },
    mode: 'none'
  }
}
