const db = require('../db')

async function insert(contact) {
  const {
    name, group, phone, vcard, meta, birthday, is_birthday_estimated
  } = contact
  await db.query(
    'insert into boxes_contacts ' +
      '(name, "group", phone, vcard, meta, birthday, is_birthday_estimated) ' +
      'values ($1, $2, $3, $4, $5, $6, $7)',
    [
      name, group, phone, JSON.stringify(vcard),
      meta, birthday, is_birthday_estimated || false
    ]
  )
}

async function selectAll() {
  const result = await db.query(
    'select id, name, phone, "group", vcard from boxes_contacts ' +
      'order by id'
  )
  return result.rows
}

async function selectById(id) {
  const result = await db.query(
    'select id, name, phone, "group", birthday, is_birthday_estimated, ' +
      'vcard, last_updated ' +
      'from boxes_contacts ' +
      'where id = $1',
    [id]
  )
  return result.rows[0]
}

async function selectVCardById(id) {
    const result = await db.query(
    'select vcard from boxes_contacts where id = $1',
    [id],
  )
  return result.rows[0] && result.rows[0].vcard
}

async function selectNextById(id) {
  const result = await db.query(
    'select id from boxes_contacts ' +
      'where id > $1 order by id asc limit 1',
    [id]
  )
  return result.rows[0]
}

async function selectPreviousById(id) {
  const result = await db.query(
    'select id from boxes_contacts ' +
      'where id < $1 order by id desc limit 1',
    [id]
  )
  return result.rows[0]
}

async function selectDistinctGroups() {
  const result = await db.query(
    'select distinct "group" from boxes_contacts ' +
      'order by "group" nulls first'
  )
  return result.rows.map(row => row.group)
}

async function selectBirthdays() {
  const result = await db.query(
    'select name, birthday, ' +
      'make_date(1900, ' +
      'cast(extract(month from birthday) as int), ' +
      'cast(extract(day from birthday) as int) ' +
      ') as sorted_birthday, ' +
      'is_birthday_estimated ' +
      'from boxes_contacts where birthday is not null order by sorted_birthday')
  return result.rows
}

async function updateById(id, contact) {
  const {
    name, group, phone, vcard, meta, birthday, is_birthday_estimated
  } = contact
  await db.query(
    'update boxes_contacts set ' +
      'name = $1, "group" = $2, phone = $3, ' +
      'vcard = $4, meta = $5, ' +
      'birthday = $6, is_birthday_estimated = $7, ' +
      'last_updated = $8 ' +
      'where id = $9',
    [
      name, group, phone, JSON.stringify(vcard),
      meta, birthday, is_birthday_estimated,
      new Date(), id
    ]
  )
}

async function deleteById(id) {
  await db.query(
    'delete from boxes_contacts where id = $1',
    [id]
  )
}

module.exports = {
  insert,
  selectAll,
  selectById,
  selectVCardById,
  selectNextById,
  selectPreviousById,
  selectDistinctGroups,
  selectBirthdays,
  updateById,
  deleteById,
}
