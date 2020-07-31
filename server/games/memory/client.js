class Client {
  static INITIAL_CARD_COLOR = 0x800080
  static SELF_SELECTED_CARD_COLOR = 0xFF0000
  static OTHERS_SELECTED_CARD_COLOR = 0x0000FF
  static SELF_MATCHED_CARD_COLOR = 0xFFA500
  static OTHERS_MATCHED_CARD_COLOR = 0x87CEEB

  socket
  players
  cards
  app

  constructor(socket, { players, cards }) {
    this.socket = socket
    this.players = players
    this.cards = cards

    this.app = new PIXI.Application()
    container.appendChild(this.app.view)

    this._drawCardSprites()

    // TODO: highlight other player selected cards
  }

  revealSelfSelectedCard(cardId, cardValue) {
    const card = this.cards.find(card => card.id === cardId)
    const { x, y, width, height } = card.spriteData
    const { rectangle } = card.sprites
    rectangle.clear()
    rectangle.beginFill(Client.SELF_SELECTED_CARD_COLOR)
    rectangle.drawRect(x, y, width, height)
    rectangle.endFill()

    card.sprites.text = this._createCardText(card, cardValue)
    this.app.stage.addChild(card.sprites.text)
  }

  highlightOtherPlayerSelectedCard(cardId, playerId) {
    const card = this.cards.find(card => card.id === cardId)
    const { x, y, width, height } = card.spriteData
    const { rectangle } = card.sprites
    rectangle.clear()
    rectangle.beginFill(Client.OTHERS_SELECTED_CARD_COLOR)
    rectangle.drawRect(x, y, width, height)
    rectangle.endFill()
  }

  _drawCardSprites() {
    const spacingX = 20
    const spacingY = 20
    const columnCount = 5
    const startX = 100
    const startY = 100
    const cardWidth = 60
    const cardHeight = 80
    this.cards.forEach((card, index) => {
      const row = Math.floor(index / columnCount)
      const col = index % columnCount
      const x = startX + col * (cardWidth + spacingX)
      const y = startY + row * (cardHeight + spacingY)
      this._createCardSprite(x, y, cardWidth, cardHeight, card)
      this.app.stage.addChild(card.sprites.rectangle)
    })
  }

  _createCardSprite(x, y, width, height, card) {
    const rectangle = new PIXI.Graphics()
    card.sprites = {
      rectangle
    }
    card.spriteData = {
      x, y, width, height,
    }
    rectangle.userData = {
      card
    }

    rectangle.beginFill(Client.INITIAL_CARD_COLOR)
    rectangle.drawRect(x, y, width, height)
    rectangle.endFill()

    rectangle.interactive = true
    rectangle.on('mouseup', _ => {
      this._handleCardClick(rectangle.userData.card)
    })

    return rectangle
  }

  _createCardText(card, string) {
    const text = new PIXI.Text(string, {
      align: 'center'
    })
    text.x = card.spriteData.x + (card.spriteData.width / 2)
    text.y = card.spriteData.y + (card.spriteData.height / 2)
    text.anchor.set(0.5, 0.5)
    return text
  }

  _handleCardClick(card) {
    socket.emit('clickedCard', {
      id: card.id,
    })
  }
}



const container = document.getElementById('pixi-container-div')
const { gameid: gameId, nickname } = container.dataset
const cookies = document.cookie
  .split(';')
  .map(cookie => cookie.split('='))
  .reduce((obj, [key, value]) => {
    obj[decodeURIComponent(key.trim())] = decodeURIComponent(value.trim())
    return obj
  }, {})
const { clientId } = cookies

const socket = io('/games/memory', {
  query: {
    clientId,
    nickname,
    gameId,
  },
  reconnection: false,
})

let client

socket.on('selfJoined', ({ gameState }) => {
  console.log(`Successfully joined the game as ${nickname}`)
  client = new Client(socket, gameState)
})

socket.on('existingConnection', () => {
})

socket.on('playerJoined', ({ id, nickname }) => {
  console.log(`Player ${nickname} (id: ${id}) joined the game`)
})

socket.on('selfSelectedCard', ({ id: cardId, value: cardValue }) => {
  client.revealSelfSelectedCard(cardId, cardValue)
})

socket.on('otherPlayerSelectedCard', ({ playerId, cardId }) => {
  client.highlightOtherPlayerSelectedCard(cardId, playerId)
})

socket.on('playerSelectCardFailed', ({ playerId, cardId }) => {
})

socket.on('playerDeselectedCard', ({ playerId, cardId }) => {
})

socket.on('matchFound', ({ playerId, cardIds, cardValue }) => {
})