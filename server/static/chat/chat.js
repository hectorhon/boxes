(function () {
  // addEventListener so that duplicate tab works
  document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect('/chat')
    const form = document.querySelector('#chat-form')
    const input = document.querySelector('#chat-form input')
    const messageArea = document.querySelector('#message-area')
    form.addEventListener('submit', function(e) {
      e.preventDefault()
      socket.emit('chat message', input.value)
      input.value = ''
      return false
    })
    socket.on('chat message', function (msg) {
      const li = document.createElement('li')
      li.innerText = msg
      messageArea.append(li)
    })
  })
})()
