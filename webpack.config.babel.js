import path from 'path'
import webpack from 'webpack'

const src = path.resolve(__dirname, 'src')

export default {
  output: {
    library: 'units',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [src],
        loader: 'babel-loader',
      },
    ],
  },
}
