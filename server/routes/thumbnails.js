const express = require('express')

const config = require('../config')
const filestore = require('../service/filestore')

const router = express.Router()

router.use('/thumbnails', express.static(config.THUMBNAILS_PATH))

// Handle missing thumbnails
router.get('/thumbnails/*', async (req, res) => {
  const imagePath = req.params[0]  // doesn't have leading slash...
  await filestore.generateThumbnail(imagePath)
  res.sendFile(
    imagePath, {
      root: config.THUMBNAILS_PATH,
    }
  )
})

module.exports = router
