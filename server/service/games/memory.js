const uuid = require('uuid')
const Game = require('../../games/memory')

const games = []
const clientIdToPlayerIdMapping = {}

function getGameById(gameId) {
  return games.find(game => game.id === gameId)
}

function createGame(gameOptions) {
  game = new Game(gameOptions)
  games.push(game)
  return game
}

// clientId is secret, do not share to other clients
function setupClient({ clientId, nickname, gameId, socket }) {
  const game = getGameById(gameId)
  const thisPlayerId = _authenticate(clientId)

  game.on('playerJoined', ({ id: playerId, nickname }) => {
    if (playerId === thisPlayerId) {
      const gameState = game.getStateForPlayer(playerId)
      socket.emit('selfJoined', {
        gameState,
      })
    } else {
      socket.emit('playerJoined', {
        id: playerId,
        nickname,
      })
    }
  })

  socket.on('clickedCard', ({ id }) => {
    game.tryPlayerSelectCard(thisPlayerId, id)
  })

  game.on('playerSelectedCard', ({ playerId, cardId }) => {
    if (playerId === thisPlayerId) {
      const cardValue = game.getCardValue(cardId)
      socket.emit('selfSelectedCard', {
        id: cardId,
        value: cardValue,
      })
    } else {
      socket.emit('playerSelectedCard', {
        playerId,
        cardId,
      })
    }
  })

  game.addPlayer(thisPlayerId, nickname)
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
  setupClient,
}
