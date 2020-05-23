const mime = require('mime-types')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const config = require('../config')
const repo = require('./repository')

async function insert(
  title,
  relPath,        // relative to filestore dir
  mimeType,       // optional
  entry_date,
  meta,
) {
  const absolutePath = path.join(config.FILESTORE_PATH, relPath)

  if (!mimeType) {
    mimeType = mime.lookup(absolutePath)
  }

  // Generate thumbnail
  const absoluteThumbnailsPath = path.join(config.THUMBNAILS_PATH, relPath)
  try {
    fs.mkdirSync(path.dirname(absoluteThumbnailsPath), {
      recursive: true,
    })
  } catch (error) {
    // ignore errors (path already exists)
  }
  await sharp(absolutePath)
    .rotate()  // Auto orient based on EXIF orientation tag and remove the tag
    .resize(200, 200, {
      fit: 'outside',
    })
    .toFile(absoluteThumbnailsPath)

  await repo.insert({
    title,
    path: relPath,
    mimeType: mimeType ? mimeType : null,
    entry_date,
    thumbnail_path: relPath,
    meta
  })
}

module.exports = {
  insert,
}
