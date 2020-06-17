class Card {
  id
  x
  y
  width
  height
  sprite

  constructor(id, x, y, width, height, onMouseDown) {
    this.id = id
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    const rectangle = new PIXI.Graphics()
    rectangle.x = x
    rectangle.y = y
    rectangle.beginFill(0x000000)
    rectangle.drawRect(0, 0, width, height)
    rectangle.endFill()
    rectangle.interactive = true
    rectangle.cursor = 'pointer'
    rectangle.on('mousedown', () => {
      onMouseDown(this)
    })
    this.sprite = rectangle
  }

  changeColor(color) {
    const rectangle = this.sprite
    rectangle.clear()
    rectangle.beginFill(color)
    rectangle.drawRect(0, 0, this.width, this.height)
    rectangle.endFill()
  }

  showValue(value, cardColor) {
    const text = new PIXI.Text(value, {
      fill: 0xFFFFFF,
      align: 'center',
    })
    text.anchor.set(0.5, 0.5)
    text.x = this.width / 2
    text.y = this.height / 2
    this.sprite.addChild(text)
    this.text = text
    this.changeColor(cardColor)
  }

  hideValue() {
    const index = this.sprite.children.indexOf(this.text)
    if (index >= 0) {
      const text = this.sprite.removeChildAt(index)
      text.destroy()
      this.text = null
      this.changeColor(0x000000)
    }
  }

  markAsMatched(value, playerColor) {
    this.hideValue()
    this.showValue(value, playerColor)
  }
}

class App {
  socket
  nickname
  playerColor
  cards = []

  constructor() {
    this.app = new PIXI.Application({
      backgroundColor: 0x654321,
    })
    document.querySelector('#pixi-div').appendChild(this.app.view)

    this.socket = io.connect('/games/memory')

    this.socket.on('connect', () => {
      console.log('You are now connected!')
    })

    this.socket.on('disconnect', () => {
      console.error('You have been disconnected!')
    })

    this.socket.on('msg', msg => {
      console.log(msg)
    })

    this.socket.on('errMsg', msg => {
      console.error(msg)
    })

    this.socket.on('joinedGame', ({ nickname, playerColor }) => {
      this.nickname = nickname
      this.playerColor = playerColor
    })

    this.socket.on('addCard', (id, x, y, width, height) => {
      const card = new Card(id, x, y, width, height, card => {
        this.onCardMouseDown(card)
      })
      this.cards.push(card)
      this.app.stage.addChild(card.sprite)
    })

    this.socket.on('showCardValue', (cardId, value, color) => {
      const card = this.cards.find(card => card.id === cardId)
      card.showValue(value, color)
    })

    this.socket.on('hideCardValue', cardId => {
      const card = this.cards.find(card => card.id === cardId)
      card.hideValue()
    })

    this.socket.on('matchFound', (
      playerId, playerNickname, playerColor,
      card1Id, card2Id,
      value
    ) => {
      const card1 = this.cards.find(card => card.id === card1Id)
      const card2 = this.cards.find(card => card.id === card2Id)
      card1.markAsMatched(value, playerColor)
      card2.markAsMatched(value, playerColor)
    })

    this.socket.on('wrongMatch', (card1Id, card2Id) => {
      const card1 = this.cards.find(card => card.id === card1Id)
      const card2 = this.cards.find(card => card.id === card2Id)
      setTimeout(() => {  // TODO some animation?
        card1.hideValue()
        card2.hideValue()
      }, 1000)
    })

    this.socket.emit('setNickname', 'james')
    this.socket.emit('joinGame', 123)
  }

  onCardMouseDown(card) {
    this.socket.emit('cardMouseDown', card.id)
  }
}

const app = new App()
