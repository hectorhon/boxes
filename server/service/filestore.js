const path = require('path')
const mime = require('mime-types')
const fs = require('fs')
const sharp = require('sharp')

const config = require('../config')
const repo = require('../repository/filestore')

async function list() {
  return repo.selectAll()
}

async function searchTitleOrPath(searchText, pageSize, pageNumber) {
  const files = await repo.selectTitleOrPathLike(searchText, pageSize, pageNumber)
  const total = await repo.countTitleOrPathLike(searchText)
  return { files, total }
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

async function generateThumbnail(relativeImagePath) {
  console.log(`Generating thumbnail for ${relativeImagePath}...`)
  const absolutePath = path.join(
    config.FILESTORE_PATH,
    relativeImagePath,
  )
  const absoluteThumbnailsPath = path.join(
    config.THUMBNAILS_PATH,
    relativeImagePath,
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
    .resize(512, 512, {
      fit: 'inside',
    })
    .toFile(absoluteThumbnailsPath)
  console.log(`Done generating thumbnail for ${relativeImagePath}`)
}

async function addImage(fileEntry) {
  const { title, path: relPath, mimeType, entryDate, meta } = fileEntry

  // Guess mimeType if not provided
  const absolutePath = path.join(config.FILESTORE_PATH, relPath)
  const mimeType = fileEntry.mimeType ||  mime.lookup(absolutePath)

  // Generate thumbnail
  await generateThumbnail(relPath)

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

async function addTagsToImages(imageIds, tagsToAdd) {
  return repo.addTagsToImages(imageIds, tagsToAdd)
}

async function removeTagsFromImages(imageIds, tagsToAdd) {
  return repo.removeTagsFromImages(imageIds, tagsToAdd)
}

module.exports = {
  list,
  searchTitleOrPath,
  add,
  addImage,
  generateThumbnail,
  getImage,
  getNextImage,
  getPreviousImage,
  searchImages,
  updateImage,
  addTagsToImages,
  removeTagsFromImages,
}
