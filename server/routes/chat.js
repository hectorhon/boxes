const express = require('express')
const socketio = require('socket.io')

const router = express.Router()

function setup(server) {
  const io = socketio(server)
  io.on('connection', socket => {
    console.log('a socket connected', socket.id)
    socket.on('chat message', message => {
      console.log('chat message: ' + message)
      io.emit('chat message', `${socket.id}: ${message}`)
    })
  })
}

router.get('/chat', (_, res) => {
  res.render('chat/index.ejs', {
    title: 'Chat',
    scripts: [
      'chat/chat.js',
    ]
  })
})

module.exports = function(server) {
  setup(server)
  return router
}
