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
      this.playerId = this.game.addPlayer(this)
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

  addCard(id, x, y, width, height) {
    this.socket.emit('addCard', id, x, y, width, height)
  }

  showCardValue(cardId, value) {
    this.socket.emit('showCardValue', cardId, value)
  }

  hideCardValue(cardId) {
    this.socket.emit('hideCardValue', cardId)
  }
}

module.exports = Client
