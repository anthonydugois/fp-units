import path from 'path'
import webpack from 'webpack'

const srcPath = path.resolve(__dirname, 'src')

export default {
  output: {
    library: 'Units',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [srcPath],
        loader: 'babel-loader',
      },
    ],
  },
}
