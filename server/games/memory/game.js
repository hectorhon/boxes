const uuid = require('uuid')

class Player {
  static colors = ['0xFF0000', '0x00FF00']
  id
  client
  nickname
  color
  selectedCards = []
  matchesFound = []
  score = 0

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
  isSelected = false
  isMatched = false
  isDisabled = false

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
    player.color = Player.colors[this.players.length % Player.colors.length]
    this.players.push(player)
    player.client.confirmJoin(player.id, player.nickname, player.color, player.score)
    this.players.slice(0, -1).forEach(player_ => {
      player.client.informJoin(player_.id, player_.nickname, player_.color, player_.score)
      player_.client.informJoin(player.id, player.nickname, player.color, player.score)
    })

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
    if (card.isDisabled) {
      // card gets disabled on wrong match
      return
    } else if (!card.isSelected) {
      if (player.selectedCards.length < 2) {
        card.isSelected = true
        player.selectedCards.push(card)
        this.players.forEach(player_ => {
          player_.client.showCardValue(cardId, card.value, player.color)
        })
      } else {
        // at most can select two cards; do nothing for now
      }
    } else if (player.selectedCards.map(card => card.id).includes(cardId)) {
      card.isSelected = false
      const index = player.selectedCards.map(card => card.id).indexOf(card.id)
      player.selectedCards.splice(index, 1)
      player.client.hideCardValue(cardId)
    } else {  // card is selected by another player
      // do nothing for now
    }
    this.checkForMatches(player)
  }

  checkForMatches(player) {
    if (player.selectedCards.length == 2) {
      const card1 = player.selectedCards[0]
      const card2 = player.selectedCards[1]
      if (card1.value === card2.value) {
        card1.isMatched = true
        card2.isMatched = true
        player.matchesFound.push([card1, card2])
        player.selectedCards.length = 0
        player.score += 10
        this.players.forEach(player_ => {
          player_.client.informMatchFound(
            player.id, player.nickname, player.color, player.score,
            card1.id, card2.id,
            card1.value
          )
        })
      } else { // wrong match
        card1.isDisabled = true
        card2.isDisabled = true
        this.players.forEach(player_ => {
          player_.client.informWrongMatch(card1.id, card2.id)
        })
        setTimeout(() => {
          card1.isSelected = false
          card2.isSelected = false
          card1.isDisabled = false
          card2.isDisabled = false
          player.selectedCards.length = 0
        }, 1000)
      }
    } else {
      // no matches
    }
  }

}

const game1 = new Game()
Game.games.push(game1)

module.exports = Game
