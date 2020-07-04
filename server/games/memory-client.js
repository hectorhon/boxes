const socket = io('/games/memory')

const app = new PIXI.Application()

const container = document.getElementById('pixi-container-div')
container.appendChild(app.view)

const rectangle = new PIXI.Graphics()
rectangle.beginFill(0xFF0000)
rectangle.drawRect(100, 200, 30, 40)
rectangle.endFill()
app.stage.addChild(rectangle)
