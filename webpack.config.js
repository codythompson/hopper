const path = require('path');


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
      rules: [
          {
              test: /template\/\w*\.(html|css)$/,
              use: [
                  {
                      loader: 'file-loader',
                      options: {
                          name: '[name].[ext]'
                      }
                  }
              ]
          }
      ]
  }
};