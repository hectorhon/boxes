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
      const { playerId, playerColor } = this.game.addPlayer(this)
      this.playerId = playerId
      socket.emit('joinedGame', {
        nickname: this.nickname,
        playerColor,
      })
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

  showCardValue(cardId, value, color) {
    this.socket.emit('showCardValue', cardId, value, color)
  }

  hideCardValue(cardId) {
    this.socket.emit('hideCardValue', cardId)
  }

  informMatchFound(
    playerId, playerNickname, playerColor,
    card1Id, card2Id,
    value
  ) {
    this.socket.emit(
      'matchFound',
      playerId, playerNickname, playerColor,
      card1Id, card2Id, value
    )
  }

  informWrongMatch(card1Id, card2Id) {
    this.socket.emit('wrongMatch', card1Id, card2Id)
  }
}

module.exports = Client
