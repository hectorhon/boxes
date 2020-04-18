const express = require('express')
const bodyParser = require('body-parser')

const contactsRouter = require('./contacts/routes')

const app = express()
const port = 3000

app.use(express.static('static'))

app.set('view engine', 'ejs')
app.set('views', '.')
app.set('view options', {
  root: __dirname
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.use(contactsRouter)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
