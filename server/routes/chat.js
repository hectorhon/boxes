const express = require('express')

const router = express.Router()

function setup(ioChat) {
  ioChat.on('connection', socket => {
    console.log('a socket connected', socket.id)
    socket.on('chat message', message => {
      console.log('chat message: ' + message)
      ioChat.emit('chat message', `${socket.id}: ${message}`)
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

module.exports = function(ioChat) {
  setup(ioChat)
  return router
}
