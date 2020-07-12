const http = require('http')
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const sassMiddleware = require('node-sass-middleware')
const path = require('path')
const socketio = require('socket.io')

const config = require('./config')
const contactsRouter = require('./routes/contacts')
const widgetsRouter = require('./routes/widgets')
const filestoreRouter = require('./routes/filestore')
const thumbnailsRouter = require('./routes/thumbnails')
const chatRouter = require('./routes/chat')
const gamesRouter = require('./routes/games')

const app = express()
const port = 3000

// https://www.w3.org/2005/10/howto-favicon recommends <link> tag
// but does not work for direct fetches e.g. /filestore/sample/image.jpg
app.get('/favicon.ico', (_, res) => {
  res.sendFile(path.join(__dirname, 'static') + '/favicon.ico')
})

app.use(sassMiddleware({
  src: path.join(__dirname, 'static'),
  prefix: '/static',
}))

app.use('/static', express.static('static'))

app.set('view engine', 'ejs')
app.set('views', 'views')
app.set('view options', {
  root: path.join(__dirname, 'views')
})

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Home',
  })
})

app.use(contactsRouter)
app.use(widgetsRouter)
app.use(filestoreRouter)
app.use(thumbnailsRouter)
app.use('/filestore', express.static(config.FILESTORE_PATH))

const server = http.createServer(app)
const io = socketio(server)
app.use(chatRouter(io.of('/chat')))
app.use(gamesRouter(io))

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
