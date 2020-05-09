module.exports = {
  mode: 'development',
  entry: {
    'Table': './widgets/frontend/table/table.jsx',
    'ImageGallery': './widgets/frontend/image-gallery/image-gallery.jsx',
  },
  output: {
    filename: '[name].js',
    library: '[name]',
    path: __dirname + '/static/dist',
  },
  externals: {
    react: 'React',
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  }
}
