const express = require('express')
const memoryRouter = require('./games/memory')

const router = express.Router()

function setup(io) {
  router.use(memoryRouter(io))
}

router.get('/games', (req, res) => {
  res.render('games/index', {
    title: 'Games',
  })
})

module.exports = function(io) {
  setup(io)
  return router
}
