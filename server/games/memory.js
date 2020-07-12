const EventEmitter = require('events')
const uuid = require('uuid')

class Card {
  id
  value
  selectedBy
  isMatched

  constructor(value) {
    this.id = uuid.v4()
    this.value = value
  }
}

class Player {
  id
  nickname
  selectedCards = []

  constructor(id, nickname) {
    this.id = id
    this.nickname = nickname
  }
}

class Game extends EventEmitter {
  cards = []
  players = []

  constructor({ numPairs }) {
    super()
    for (let pairIndex = 0; pairIndex < numPairs; pairIndex++) {
      for (let i = 0; i < 2; i++) {
        const value = pairIndex // * 2 + i
        const card = new Card(value)
        this.cards.push(card)
      }
    }
  }

  addPlayer(id, nickname) {
    const player = new Player(id, nickname)
    this.players.push(player)
    this.emit('playerJoined', {
      id: player.id,
      nickname: player.nickname,
    })
  }

  tryPlayerSelectCard(playerId, cardId) {
    const player = this.players.find(player => player.id === playerId)
    const card = this.cards.find(card => card.id === cardId)
    if (card.isMatched) {
      this.emit('playerSelectCardFailed', {
        playerId,
        cardId,
      })
    } else if (!card.selectedBy) {
      this._selectCard(player, card)
      if (player.selectedCards.length >= 2) {
        const hasMatch = this._checkForMatches(player)
        if (hasMatch) {
          player.selectedCards.forEach(card => {
            card.isMatched = true
            card.selectedBy = null
          })
          player.selectedCards.length = 0
        }
      }
    } else if (card.selectedBy == player) {
      this._deselectCard(player, card)
    } else {
      this.emit('playerSelectCardFailed', {
        playerId,
        cardId,
      })
    }
  }

  getStateForPlayer(playerId) {
    const player = this.players.find(player => player.id === playerId)
    return {
      players: this.players.map(player => {
        if (player.id === playerId) {
          return {
            id: player.id,
            nickname: player.nickname,
            selectedCards: player.selectedCards,
          }
        } else {
          return  {
            id: player.id,
            nickname: player.nickname,
          }
        }
      }),
      cards: this.cards.map(card => {
        if (card.isMatched || player.selectedCards.indexOf(card) >= 0) {
          return {
            id: card.id,
            value: card.value,
            selectedBy: card.selectedBy,
          }
        } else {
          return {
            id: card.id,
            selectedBy: card.selectedBy,
          }
        }
      })
    }
  }

  _checkForMatches(player) {
    const card1 = player.selectedCards[0]
    const card2 = player.selectedCards[1]
    if (card1.value === card2.value) {
      this.emit('matchFound', {
        playerId: player.id,
        cardIds: [card1.id, card2.id],
        cardValue: card1.value,
      })
      return true
    } else {
      return false
    }
  }

  _selectCard(player, card) {
    card.selectedBy = player
    player.selectedCards.push(card)
    this.emit('playerSelectedCard', {
      playerId: player.id,
      cardId: card.id,
    })
  }

  _deselectCard(player, card) {
    card.selectedBy = null
    const selectedCardIndex = player.selectedCards.findIndex(card_ => card_ === card)
    player.selectedCards.splice(selectedCardIndex, 1)
    this.emit('playerDeselectedCard', {
      playerId: player.id,
      cardId: card.id,
    })
  }
}

module.exports = Game
