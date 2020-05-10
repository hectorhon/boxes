const express = require('express')
const bodyParser = require('body-parser')
const sassMiddleware = require('node-sass-middleware')
const path = require('path')

const contactsRouter = require('./contacts/routes')
const widgetsRouter = require('./widgets/routes')
const filestoreRouter = require('./filestore/routes')

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
app.set('views', '.')
app.set('view options', {
  root: __dirname
})

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

app.use('/filestore', express.static('../data/filestore'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
