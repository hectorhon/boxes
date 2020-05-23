const express = require('express')

const repo = require('./repository')
const service = require('./service')

const router = express.Router()

function wrap(asyncFunction) {
  return ((req, res) => {
    asyncFunction(req, res).catch(err => {
      if (process.env.NODE_ENV) {
        res.status(500)
      } else {
        res.status(500).send(err)
      }
    })
  })
}

router.get('/filestore', wrap(async (_, res) => {
  const fileEntries = await repo.list()
  res.render('filestore/views/list', {
    title: 'Files',
    fileEntries,
  })
}))

router.get('/filestore/newEntry', wrap(async (_, res) => {
  res.render('filestore/views/newEntry', {
    title: 'Files - New entry',
  })
}))

router.post('/filestore/newEntry', wrap(async (req, res) => {
  const { title, path } = req.body
  await repo.insert({
    title,
    path,
  })
  res.redirect('/filestore')
}))

router.post('/api/filestore/newEntry', wrap(async (req, res) => {
  const { batch } = req.query
  const { title, path, mimeType, entryDate } = req.body
  service.insert(
    title,
    path,
    mimeType,
    entryDate,
    { batch },
  )
  res.status(200).end()
}))

router.get('/filestore/images', wrap(async (_, res) => {
  res.render('filestore/views/images', {
    title: 'Images',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'dist/ImageGallery.js',
      'filestore/images.js',
    ]
  })
}))

router.get('/api/filestore/images', wrap(async (req, res) => {
  const { searchText, pageSize, pageNumber } = req.query
  const images = await repo.searchImages(searchText, pageSize, pageNumber)
  const count = await repo.getImageCount(searchText)
  res.json({
    images,
    length: count
  })
}))

module.exports = router
