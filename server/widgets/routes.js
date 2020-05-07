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
      'widgets/react-hello-world.js',
    ],
  })
})

router.get('/widgets/table', (req, res) => {
  res.render('widgets/views/table', {
    title: 'Widgets - Table',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'dist/Table.js',
      'widgets/table-example.js',
    ],
  })
})

module.exports = router
