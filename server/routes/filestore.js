const express = require('express')

const filestore = require('../service/filestore')

const router = express.Router()

function wrap(asyncFunction) {
  return ((req, res) => {
    asyncFunction(req, res).catch(err => {
      if (process.env.NODE_ENV) {
        res.status(500).end()
      } else {
        res.status(500).send(err.toString())
      }
    })
  })
}

router.get('/filestore', wrap(async (_, res) => {
  const fileEntries = await filestore.list()
  res.render('filestore/list', {
    title: 'Files',
    fileEntries,
  })
}))

router.get('/filestore/newEntry', wrap(async (_, res) => {
  res.render('filestore/newEntry', {
    title: 'Files - New entry',
  })
}))

router.post('/filestore/newEntry', wrap(async (req, res) => {
  const { title, path } = req.body
  await filestore.add({
    title,
    path,
  })
  res.redirect('/filestore')
}))

router.post('/api/filestore/newEntry', wrap(async (req, res) => {
  const { batch } = req.query
  const { title, path, mimeType, entryDate } = req.body
  await filestore.add({
    title,
    path,
    mimeType,
    entryDate,
    meta: { batch },
  })
  res.status(200).end()
}))

router.get('/filestore/images', wrap(async (_, res) => {
  res.render('filestore/images', {
    title: 'Images',
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'dist/ImageGallery.js',
      'filestore/images.js',
    ]
  })
}))

router.get('/filestore/images/view', wrap(async (req, res) => {
  const { id: imageId } = req.query
  const nextImage = await filestore.getNextImage(imageId)
  const prevImage = await filestore.getPreviousImage(imageId)
  res.render('filestore/images/view', {
    title: 'Images - View',
    imageId,
    nextImage,
    prevImage,
    scripts: [
      'vendor/react/react.development.js',
      'vendor/react/react-dom.development.js',
      'dist/ImageViewer.js',
      'filestore/images-view.js',
    ]
  })
}))

router.post('/filestore/images/update', wrap(async (req, res) => {
  const { id } = req.query
  const { title, tags } = req.body
  await filestore.updateImage(id, {
    title,
    tags: tags.split(','),
  })
  res.redirect('/filestore/images/view?id=' + id)
}))

router.get('/api/filestore/images', wrap(async (req, res) => {
  const { query, pageSize, pageNumber } = req.query
  const searchResult = await filestore.searchImages(query, pageSize, pageNumber)
  res.json(searchResult)
}))

router.get('/api/filestore/image/:id', wrap(async (req, res) => {
  const { id } = req.params
  const image = await filestore.getImage(id)
  if (!image) {
    res.status(404).end()
  } else {
    res.json(image)
  }
}))

router.post('/api/filestore/image/add-tags', wrap(async (req, res) => {
  const { imageIds, tagsToAdd } = req.body
  await filestore.addTagsToImages(imageIds, tagsToAdd)
  res.sendStatus(200)
}))

router.post('/api/filestore/image/remove-tags', wrap(async (req, res) => {
  const { imageIds, tagsToRemove } = req.body
  await filestore.removeTagsFromImages(imageIds, tagsToRemove)
  res.sendStatus(200)
}))

module.exports = router
