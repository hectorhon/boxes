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

async function selectImageById(id) {
  const result = await db.query(
    'select id, title, path, add_date, mime_type, entry_date, meta, tags ' +
      "from boxes_filestore where mime_type like 'image/%' and id = $1",
    [id]
  )
  return result.rows[0]
}

async function selectNextImage(id, sortBy) {
  const subquery = `select ${sortBy} from boxes_filestore where id = $1`
  const result = await db.query(
    'select id from boxes_filestore ' +
      "where mime_type like 'image/%' " +
      `and ${sortBy} > (${subquery}) ` +
      `order by ${sortBy} asc limit 1`,
    [id]
  )
  return result.rows[0]
}

async function selectPreviousImage(id, sortBy) {
  const subquery = `select ${sortBy} from boxes_filestore where id = $1`
  const result = await db.query(
    'select id from boxes_filestore ' +
      "where mime_type like 'image/%' " +
      `and ${sortBy} < (${subquery}) ` +
      `order by ${sortBy} desc limit 1`,
    [id]
  )
  return result.rows[0]
}

async function searchImages(query, pageSize, pageNumber) {
  const sql = 'select id, title, thumbnail_path, add_date, tags from boxes_filestore ' +
    "where mime_type like 'image/%' " +
    'and (title ilike $1 or tags && $2) ' +
    'order by add_date ' +
    'limit $3 offset $4'
  const result = await db.query(
    sql,
    [`%${query}%`, [query], pageSize, pageSize * (pageNumber - 1)]
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

async function updateImage(id, fileEntry) {
  const { title, tags } = fileEntry
  const sql = 'update boxes_filestore ' +
    'set title = $1, tags = $2 ' +
    'where id = $3'
  return db.query(sql, [title, tags, id])
}

async function addTagsToImages(imageIds, tagsToAdd) {
  const addTagsQuery = `
    update boxes_filestore
    set tags = (select array_agg(distinct combinedTags) from unnest(tags || $1) combinedTags)
    where id = any ($2)`
  await db.query(addTagsQuery, [tagsToAdd, imageIds])
}

async function removeTagsFromImages(imageIds, tagsToRemove) {
  const removeTagsQuery = `
with unnested as (
  select id, unnest(tags) as tag from boxes_filestore
), filtered as (
  select id, array_agg(tag) as tags from unnested
  where tag != all ($1)
  group by id
)
update boxes_filestore
set tags = coalesce(
  (select tags from filtered where filtered.id = boxes_filestore.id),
  '{}')
where id = any ($2)`
  await db.query(removeTagsQuery, [tagsToRemove, imageIds])
}

module.exports = {
  insert,
  selectAll,
  selectImageById,
  selectNextImage,
  selectPreviousImage,
  searchImages,
  countMatchingImages,
  updateImage,
  addTagsToImages,
  removeTagsFromImages,
}
