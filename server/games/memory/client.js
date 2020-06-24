const Game = require('./game')

class Client {
  socket
  nickname
  playerId
  game

  constructor(socket) {
    this.socket = socket

    socket.on('setNickname', nickname => {
      this.nickname = nickname
    })

    socket.on('joinGame', gameId => {
      // this.game = Game.games.find(game => game.id === gameId)
      this.game = Game.games[0]
      const playerId = this.game.addPlayer(this)
      this.playerId = playerId
    })

    socket.on('cardMouseDown', cardId => {
      this.game.handleCardMouseDown(this.playerId, cardId)
    })
  }

  sendErrorMessage(msg) {
    this.socket.emit('errMsg', msg)
  }

  sendMessage(msg) {
    this.socket.emit('msg', msg)
  }

  confirmJoin(playerId, playerNickname, playerColor, playerScore) {
    this.socket.emit('joinedGame', playerId, playerNickname, playerColor, playerScore)
  }

  informJoin(playerId, playerNickname, playerColor, playerScore) {
    this.socket.emit('alsoJoinedGame', playerId, playerNickname, playerColor, playerScore)
  }

  addCard(id, x, y, width, height) {
    this.socket.emit('addCard', id, x, y, width, height)
  }

  showCardSelected(cardId, color) {
    this.socket.emit('showCardSelected', cardId, color)
  }

  showCardValue(cardId, value) {
    this.socket.emit('showCardValue', cardId, value)
  }

  hideCardSelected(cardId) {
    this.socket.emit('hideCardSelected', cardId)
  }

  hideCardValue(cardId) {
    this.socket.emit('hideCardValue', cardId)
  }

  informMatchFound(
    playerId, playerNickname, playerColor, playerScore,
    card1Id, card2Id, value
  ) {
    this.socket.emit(
      'matchFound',
      playerId, playerNickname, playerColor, playerScore,
      card1Id, card2Id, value
    )
  }

  informWrongMatch(card1Id, card2Id) {
    this.socket.emit('wrongMatch', card1Id, card2Id)
  }

  informGameOver(winners) {
    this.socket.emit('gameOver', winners)
  }
}

module.exports = Client
