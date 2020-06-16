const uuid = require('uuid')

class Player {
  id
  client
  nickname
  selectedCards = []

  constructor(client) {
    this.id = uuid.v4()
    this.client = client
    this.nickname = client.nickname
  }
}

class Card {
  id
  value
  x
  y
  width
  height
  visibleTo = []
  isSelected = false

  constructor(value, x, y, width, height) {
    this.id = uuid.v4()
    this.value = value
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

class Game {
  static games = []
  id
  players = []
  cards = []

  constructor() {
    this.id = uuid.v4()
  }

  addPlayer(client) {
    const numPlayers = 2
    if (this.players.length >= numPlayers) {
      client.sendErrorMessage('Game is already full.')
      return
    }
    const player = new Player(client)
    this.players.push(player)
    if (this.players.length >= numPlayers) {
      this.prepare()
    }
    return player.id
  }

  announce(message) {
    this.players.forEach(player => player.client.sendMessage(message))
  }

  prepare() {
    this.announce('Creating the cards.')
    const numPairs = 5
    const gridXCount = 5
    // const gridYCount = 4
    const gridXStart = 20
    const gridYStart = 20
    const spacingX = 20
    const spacingY = 20
    const cardWidth = 60
    const cardHeight = 80
    for (let i = 0; i < numPairs; i++) {
      for (let index = i*2; index < i*2+2; index++) {
        const gridXIndex = index % gridXCount
        const gridYIndex = Math.floor(index / gridXCount)
        const x = gridXStart + (cardWidth + spacingX) * gridXIndex
        const y = gridYStart + (cardHeight + spacingY) * gridYIndex
        const value = i
        const card = new Card(value, x, y, cardWidth, cardHeight)
        this.cards.push(card)
        this.players.forEach(player => {
          player.client.addCard(card.id, x, y, cardWidth, cardHeight)
        })
      }
    }
  }

  handleCardMouseDown(playerId, cardId) {
    const card = this.cards.find(card => card.id === cardId)
    const player = this.players.find(player => player.id === playerId)
    if (!card.isSelected) {
      card.isSelected = true
      player.selectedCards.push(card)
      player.client.showCardValue(cardId, card.value)
    } else if (player.selectedCards.map(card => card.id).includes(cardId)) {
      card.isSelected = false
      const index = player.selectedCards.map(card => card.id).indexOf(card.id)
      player.selectedCards.splice(index, 1)
      player.client.hideCardValue(cardId)
    } else {  // card is selected by another player
      // do nothing for now
    }
  }

}

const game1 = new Game()
Game.games.push(game1)

module.exports = Game
