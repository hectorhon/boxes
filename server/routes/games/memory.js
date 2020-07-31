const express = require('express')
const uuid = require('uuid')
const cors = require('cors')

const memoryGameService = require('../../service/games/memory')

const router = express.Router()

function setup(io) {
  const namespacedIo = io.of('/games/memory')
  namespacedIo.on('connection', socket => {
    const { clientId, nickname, gameId } = socket.handshake.query
    memoryGameService.setupClient({
      clientId,
      nickname,
      gameId,
      socket,
    })
  })
}

router.get('/games/memory', (req, res) => {
  const { gameId, nickname } = req.query
  if (!nickname) {
    res.status(400).send('Nickname is required.')
    return
  }
  let clientId = req.cookies.clientId
  if (!clientId) {
    clientId = uuid.v4()
    res.cookie('clientId', clientId)
  }
  if (!gameId) {
    const newGameId = memoryGameService.createGame({
      numPairs: 5
    })
    res.redirect(`/games/memory?gameId=${newGameId}&nickname=${encodeURIComponent(nickname)}`)
  } else {
    const game = memoryGameService.getGameById(gameId)
    if (!game) {
      res.status(404).send(`Game with id ${gameId} not found.`)
    } else {
      res.render('games/memory', {
        title: 'Games - Memory',
        gameId,
        nickname,
        scripts: [
          'vendor/pixijs/pixi.js',
          'dist/MemoryGame.js',
        ]
      })
    }
  }
})

router.post('/games/memory/create', cors({ origin: 'http://localhost:3001' }), (_, res) => {
  const newGameId = memoryGameService.createGame({
    numPairs: 5
  })
  res.status(200).json({
    gameId: newGameId
  })
})

module.exports = function(io) {
  setup(io)
  return router
}
