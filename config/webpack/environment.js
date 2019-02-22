const { environment } = require('@rails/webpacker')

environment.loaders.append('worker', {
  test: /\.worker\.js$/,
  use: {
    loader: 'worker-loader',
    options: {
      inline: true,
      fallback: false
    }
  }
})

module.exports = environment
