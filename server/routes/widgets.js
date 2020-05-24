const express = require('express')

const router = express.Router()

router.get('/widgets', (_, res) => {
  res.render('widgets/index', {
    title: 'Widgets',
  })
})

router.get('/widgets/react-hello-world', (_, res) => {
  res.render('widgets/react-hello-world', {
    title: 'Widgets - React Hello World',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'widgets/react-hello-world.js',
    ],
  })
})

router.get('/widgets/table', (_, res) => {
  res.render('widgets/table', {
    title: 'Widgets - Table',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'dist/Table.js',
      'widgets/table-example.js',
    ],
  })
})

router.get('/widgets/image-gallery', (_, res) => {
  res.render('widgets/image-gallery', {
    title: 'Widgets - Image gallery',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'dist/ImageGallery.js',
      'widgets/image-gallery-example.js',
    ],
  })
})

module.exports = router
