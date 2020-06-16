const express = require('express')

const Client = require('../../games/memory/client')

const router = express.Router()
const clients = []

function setup(io) {
  io.on('connection', socket => {
    const client = new Client(socket)
    clients.push(client)
  })
}

router.get('/games/memory', (_, res) => {
  res.render('games/memory/index.ejs', {
    title: 'Games - memory',
    scripts: [
      'vendor/pixi/pixi.js',
      'dist/MemoryGame.js',
    ]
  })
})

module.exports = function(io) {
  setup(io)
  return router
}
