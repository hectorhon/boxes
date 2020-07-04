const express = require('express')

const router = express.Router()

function setup(io) {
  io.on('connection', socket => {
    console.log(`${socket.id} connected`)
  })
}

router.get('/games/memory', (_, res) => {
  res.render('games/memory', {
    title: 'Games - Memory',
    scripts: [
      'vendor/pixijs/pixi.js',
      'dist/MemoryGame.js',
    ]
  })
})

module.exports = function(io) {
  setup(io)
  return router
}
