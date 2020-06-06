const path = require('path')
const mime = require('mime-types')

const repo = require('../repository/filestore')

async function list() {
  return repo.selectAll()
}

async function add(fileEntry) {
  const { title, path: relPath, mimeType, entryDate, meta } = fileEntry
  await repo.insert({
    title,
    path: relPath,
    mimeType,
    entryDate,
    meta,
  })
}

async function addImage(fileEntry) {
  const { title, path: relPath, mimeType, entryDate, meta } = fileEntry

  const absolutePath = path.join(config.FILESTORE_PATH, relPath)

  // Guess mimeType if not provided
  const mimeType = fileEntry.mimeType ||  mime.lookup(absolutePath)

  // Generate thumbnail
  const absoluteThumbnailsPath = path.join(
    config.THUMBNAILS_PATH,
    relPath
  )
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

  // Save file entry
  await repo.insert({
    title,
    path: relPath,
    mimeType,
    entryDate,
    thumbnailPath: relPath,
    meta,
  })
}

async function getImage(id) {
  return repo.selectImageById(id)
}

async function getNextImage(id, sortBy = 'add_date') {
  return repo.selectNextImage(id, sortBy)
}

async function getPreviousImage(id, sortBy = 'add_date') {
  return repo.selectPreviousImage(id, sortBy)
}

async function searchImages(query = '', pageSize = 10, pageNumber = 1) {
  const images = await repo.searchImages(query, pageSize, pageNumber)
  const total = await repo.countMatchingImages(query)
  return { images, total }
}

async function updateImage(id, fileEntry) {
  return repo.updateImage(id, fileEntry)
}

module.exports = {
  list,
  add,
  addImage,
  getImage,
  getNextImage,
  getPreviousImage,
  searchImages,
  updateImage,
}
