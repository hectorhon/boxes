const db = require('../db')

async function insert(fileEntry) {
  const { title, path, mimeType, entryDate, thumbnailPath, meta } = fileEntry
  await db.query(
    'insert into boxes_filestore ' +
      '(title, path, add_date, mime_type, entry_date, thumbnail_path, meta) ' +
      'values ($1, $2, $3, $4, $5, $6, $7)',
    [title, path, new Date(), mimeType, entryDate, thumbnailPath, meta]
  )
}

async function selectAll() {
  const result = await db.query(
    'select id, title, path, add_date from boxes_filestore ' +
      'order by add_date desc'
  )
  return result.rows
}

async function searchImages(query, pageSize, pageNumber) {
  const sql = 'select id, title, thumbnail_path, add_date from boxes_filestore ' +
    "where mime_type like 'image/%' " +
    'and (title ilike $1) ' +
    'order by add_date ' +
    'limit $2 offset $3'
  const result = await db.query(
    sql,
    [`%${query}%`, pageSize, pageSize * (pageNumber - 1)]
  )
  return result.rows
}

async function countMatchingImages(query) {
  const sql = 'select count(*) as count from boxes_filestore ' +
    "where mime_type like 'image/%' " +
    'and (title ilike $1) '
  const result = await db.query(
    sql,
    [`%${query}%`]
  )
  return result.rows[0].count
}

module.exports = {
  insert,
  selectAll,
  searchImages,
  countMatchingImages,
}