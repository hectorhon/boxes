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
    rectangle.beginFill(0xFFFFFF)
    rectangle.drawRect(0, 0, width, height)
    rectangle.endFill()
    rectangle.interactive = true
    rectangle.cursor = 'pointer'
    rectangle.on('mousedown', () => {
      onMouseDown(this)
    })
    this.sprite = rectangle
  }

  showValue(value) {
    const text = new PIXI.Text(value, {
      fill: 0x0000FF,
      align: 'center',
    })
    text.anchor.set(0.5, 0.5)
    text.x = this.width / 2
    text.y = this.height / 2
    this.sprite.addChild(text)
    this.text = text
  }

  hideValue() {
    const index = this.sprite.children.indexOf(this.text)
    const text = this.sprite.removeChildAt(index)
    text.destroy()
    this.text = null
  }
}

class App {
  socket
  cards = []

  constructor() {
    this.app = new PIXI.Application({
      backgroundColor: 0x654321,
    })
    document.querySelector('#pixi-div').appendChild(this.app.view)

    this.socket = io.connect('/games/memory')

    this.socket.on('msg', msg => {
      console.log(msg)
    })

    this.socket.on('errMsg', msg => {
      console.error(msg)
    })

    this.socket.on('addCard', (id, x, y, width, height) => {
      const card = new Card(id, x, y, width, height, card => {
        this.onCardMouseDown(card)
      })
      this.cards.push(card)
      this.app.stage.addChild(card.sprite)
    })

    this.socket.on('showCardValue', (cardId, value) => {
      const card = this.cards.find(card => card.id === cardId)
      card.showValue(value)
    })

    this.socket.on('hideCardValue', cardId => {
      const card = this.cards.find(card => card.id === cardId)
      card.hideValue()
    })

    this.socket.emit('setNickname', 'james')
    this.socket.emit('joinGame', 123)
  }

  onCardMouseDown(card) {
    this.socket.emit('cardMouseDown', card.id)
  }
}

const app = new App()
