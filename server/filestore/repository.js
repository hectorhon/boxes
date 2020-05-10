const db = require('../db')

/*
  create table boxes_filestore (
  id serial primary key,
  name varchar,
  path varchar,
  add_date timestamp with time zone,
  mime_type varchar
  )
*/

async function list() {
  const result = await db.query(
    'select id, name, path, add_date from boxes_filestore ' +
      'order by add_date desc'
  )
  return result.rows
}

async function insert(fileEntry) {
  const { name, path } = fileEntry
  await db.query(
    'insert into boxes_filestore ' +
      '(name, path, add_date) ' +
      'values ($1, $2, $3)',
    [name, path, new Date()]
  )
}

async function listImages() {
  const result = await db.query(
    'select id, name, path, add_date from boxes_filestore ' +
      "where mime_type like 'image/%'"
  )
  return result.rows
}

async function searchImages(searchText = '', pageSize = 10, pageNumber = 1) {
  const query = 'select id, name, path, add_date from boxes_filestore ' +
    "where mime_type like 'image/%' " +
    'and (name ilike $1) ' +
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
    'and (name ilike $1) '
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