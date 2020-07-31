const uuid = require('uuid')
const logger = require('../../logger')
const Game = require('../../games/memory/core')

const log = logger.child({ component: 'service/games/memory' })
const games = []
const clientIdToPlayerIdMapping = {}

function getGameById(gameId) {
  return games.find(game => game.id === gameId)
}

function createGame(gameOptions) {
  const game = new Game(gameOptions)
  games.push(game)
  return game.id
}

function destroyGame(gameId) {
  const index = games.findIndex(game => game.id === gameId)
  games.splice(index, 1)
}

// clientId is secret, do not share to other clients
function setupClient({ clientId, nickname, gameId, socket }) {
  log.info({ clientId, gameId }, 'Setting up client')

  const game = getGameById(gameId)
  if (!game) {
    socket.emit('invalidGameId')
    return
  }

  const thisPlayerId = _authenticate(clientId)
  log.info({ clientId, playerId: thisPlayerId }, 'Mapped clientId to playerId')

  socket.on('disconnect', reason => {
    log.info({ clientId, reason }, 'Client disconnected')
    game.handlePlayerDisconnected(thisPlayerId)
  })

  game.on('playerJoined', ({ id: playerId, nickname }) => {
    if (playerId === thisPlayerId) {
      const gameState = game.getStateForPlayer(playerId)
      console.log(gameState)
      socket.emit('selfJoined', {
        playerId,
        gameState,
      })
    } else {
      socket.emit('playerJoined', {
        id: playerId,
        nickname,
      })
    }
  })

  game.on('playerDisconnected', ({ id: playerId }) => {
    if (playerId === thisPlayerId) {
      // Nothing to do here since the player himself has disconnected
    } else {
      socket.emit('playerDisconnected', {
        id: playerId
      })
    }
  })

  game.on('playerReconnected', ({ id: playerId }) => {
    if (playerId === thisPlayerId) {
      const gameState = game.getStateForPlayer(playerId)
      socket.emit('selfReconnected', {
        playerId,
        gameState,
      })
    } else {
      socket.emit('playerReconnected', {
        id: playerId,
        // nickname,
      })
    }
  })

  socket.on('clickedCard', ({ id }) => {
    log.info({ playerId: thisPlayerId, cardId: id }, 'Clicked a card')
    game.tryPlayerSelectCard(thisPlayerId, id)
  })

  game.on('playerSelectedCard', ({ playerId, cardId, cardValue }) => {
    if (playerId === thisPlayerId) {
      log.info({ cardId, cardValue, thisPlayerId }, 'Emit selfSelectedCard event')
      socket.emit('selfSelectedCard', {
        id: cardId,
        value: cardValue,
      })
    } else {
      socket.emit('otherPlayerSelectedCard', {
        playerId,
        cardId,
      })
    }
  })

  game.on('playerSelectCardFailed', ({ playerId, cardId }) => {
    socket.emit('playerSelectCardFailed', { playerId, cardId })
  })

  game.on('playerDeselectedCard', ({ playerId, cardId }) => {
    socket.emit('playerDeselectedCard', { playerId, cardId })
  })

  game.on('matchFound', ({ playerId, cardIds, cardValue }) => {
    socket.emit('matchFound', { playerId, cardIds, cardValue })
  })

  game.addPlayer(thisPlayerId, nickname, () => {
    socket.emit('existingConnection')
  })
}

function _authenticate(clientId) {
  let playerId = clientIdToPlayerIdMapping[clientId]
  if (!playerId) {
    playerId = uuid.v4()
    clientIdToPlayerIdMapping[clientId] = playerId
  }
  return playerId
}

module.exports = {
  getGameById,
  createGame,
  destroyGame,
  setupClient,
}
