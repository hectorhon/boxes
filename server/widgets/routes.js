const express = require('express')

const router = express.Router()

router.get('/widgets', (req, res) => {
  res.render('widgets/views/index', {
    title: 'Widgets',
  })
})

router.get('/widgets/react-hello-world', (req, res) => {
  res.render('widgets/views/react-hello-world', {
    title: 'Widgets - React Hello World',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'scripts/widgets/react-hello-world.js'
    ],
  })
})

module.exports = router
