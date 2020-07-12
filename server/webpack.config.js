module.exports = {
  mode: 'development',
  entry: {
    'Table': './widgets/table/table.jsx',
    'ExtendedSelect': './widgets/extended-select/extended-select.jsx',
    'ImageGallery': './widgets/image-gallery/image-gallery.jsx',
    'ImageViewer': './widgets/image-gallery/image-viewer.jsx',
    'MemoryGame': './games/memory-client.js',
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
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-class-properties',
            ]
          }
        }
      },
    ]
  }
}
