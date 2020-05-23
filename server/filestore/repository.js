const db = require('../db')

/*
  create table boxes_filestore (
  id serial primary key,
  title varchar,
  path varchar,
  add_date timestamp with time zone,
  mime_type varchar,
  entry_date timestamp with time zone,
  thumbnail_path varchar,
  meta jsonb
  )
*/

async function list() {
  const result = await db.query(
    'select id, title, path, add_date from boxes_filestore ' +
      'order by add_date desc'
  )
  return result.rows
}

async function insert(fileEntry) {
  const { title, path, mimeType, entry_date, thumbnail_path, meta } = fileEntry
  await db.query(
    'insert into boxes_filestore ' +
      '(title, path, add_date, mime_type, entry_date, thumbnail_path, meta) ' +
      'values ($1, $2, $3, $4, $5, $6, $7)',
    [title, path, new Date(), mimeType, entry_date, thumbnail_path, meta]
  )
}

async function listImages() {
  const result = await db.query(
    'select id, title, path, add_date from boxes_filestore ' +
      "where mime_type like 'image/%'"
  )
  return result.rows
}

async function searchImages(searchText = '', pageSize = 10, pageNumber = 1) {
  const query = 'select id, title, thumbnail_path, add_date from boxes_filestore ' +
    "where mime_type like 'image/%' " +
    'and (title ilike $1) ' +
    'order by add_date ' +
    'limit $2 offset $3'
  const result = await db.query(
    query,
    [`%${searchText}%`, pageSize, pageSize * (pageNumber - 1)]
  )
  return result.rows
}

async function getImageCount(searchText) {
  const query = 'select count(*) as count from boxes_filestore ' +
    "where mime_type like 'image/%' " +
    'and (title ilike $1) '
  const result = await db.query(
    query,
    [`%${searchText}%`]
  )
  return result.rows[0].count
}

module.exports = {
  list,
  insert,
  listImages,
  searchImages,
  getImageCount,
}
