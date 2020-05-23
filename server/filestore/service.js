const mime = require('mime-types')

const repo = require('./repository')

async function insert(
  title,
  path,           // relative to filestore dir
  mimeType,       // optional
  entry_date,
  meta,
) {
  if (!mimeType) {
    mimeType = mime.lookup(path)
  }
  await repo.insert({
    title,
    path,
    mimeType: mimeType ? mimeType : null,
    entry_date,
    meta
  })
}

module.exports = {
  insert,
}
