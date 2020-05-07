module.exports = {
  mode: 'development',
  entry: {
    'Table': './widgets/frontend/table/table.jsx',
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
