module.exports = {
  mode: 'development',
  entry: {
    'Table': './widgets/table/table.jsx',
    'ImageGallery': './widgets/image-gallery/image-gallery.jsx',
    'ImageViewer': './widgets/image-gallery/image-viewer.jsx',
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
