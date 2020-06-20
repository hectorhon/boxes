class Player {
  id
  nickname
  color
  score

  constructor(id, nickname, color, score) {
    this.id = id
    this.nickname = nickname
    this.color = color
    this.score = score
  }
}

class Ui {
  sprite
  scoreBoardRows = []

  constructor() {
    this.sprite = new PIXI.Sprite()
  }

  addPlayerToScoreBoard(player) {
    const nicknameText = this.createPlayerNicknameText(player.nickname)
    const scoreText = this.createScoreText(player.score)
    this.scoreBoardRows.push([player.id, nicknameText, scoreText])
  }

  createPlayerNicknameText(nickname) {
    const text = new PIXI.Text(nickname, {
      fill: 0xFFFFFF,
      align: 'center',
    })
    text.anchor.set(0.5, 0.5)
    text.x = 600
    text.y = 50 + this.scoreBoardRows.length * 30
    this.sprite.addChild(text)
    return text
  }

  createScoreText(score) {
    const text = new PIXI.Text(score.toString(), {
      fill: 0xFFFFFF,
      align: 'center',
    })
    text.anchor.set(0.5, 0.5)
    text.x = 700
    text.y = 50 + this.scoreBoardRows.length * 30
    this.sprite.addChild(text)
    return text
  }

  updateScore(playerId, newScore) {
    const row = this.scoreBoardRows.find(row => row[0] === playerId)
    const scoreText = row[2]
    scoreText.text = newScore.toString()
  }
}

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
  player
  otherPlayers = []
  cards = []
  ui

  constructor() {
    this.app = new PIXI.Application({
      backgroundColor: 0x654321,
    })
    document.querySelector('#pixi-div').appendChild(this.app.view)

    this.ui = new Ui()
    this.app.stage.addChild(this.ui.sprite)

    this.socket = io.connect('/games/memory')
    this.setupEventHandlers()

    this.socket.emit('setNickname', 'james')  // TODO way to set nickname
    this.socket.emit('joinGame', 123)
  }

  setupEventHandlers() {
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

    this.socket.on('joinedGame', (
      playerId, playerNickname, playerColor, playerScore,
    ) => {
      this.player = new Player(playerId, playerNickname, playerColor, playerScore)
      this.ui.addPlayerToScoreBoard(this.player)
    })

    this.socket.on('alsoJoinedGame', (
      playerId, playerNickname, playerColor, playerScore,
    ) => {
      const player = new Player(playerId, playerNickname, playerColor, playerScore)
      this.otherPlayers.push(player)
      this.ui.addPlayerToScoreBoard(player)
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
      playerId, playerNickname, playerColor, playerScore,
      card1Id, card2Id,
      value
    ) => {
      const card1 = this.cards.find(card => card.id === card1Id)
      const card2 = this.cards.find(card => card.id === card2Id)
      card1.markAsMatched(value, playerColor)
      card2.markAsMatched(value, playerColor)
      this.ui.updateScore(playerId, playerScore)
    })

    this.socket.on('wrongMatch', (card1Id, card2Id) => {
      const card1 = this.cards.find(card => card.id === card1Id)
      const card2 = this.cards.find(card => card.id === card2Id)
      setTimeout(() => {  // TODO some animation?
        card1.hideValue()
        card2.hideValue()
      }, 1000)
    })
  }

  onCardMouseDown(card) {
    this.socket.emit('cardMouseDown', card.id)
  }
}

const app = new App()
