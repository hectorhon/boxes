const db = require('../db')

// create table boxes_contacts (
// id serial primary key,
// name varchar,
// phone varchar,
// group varchar,
// vcard jsonb,
// meta jsonb,
// last_updated timestamp with time zone,
// birthday date,
// is_birthday_estimated bool
// )

async function list() {
  const result = await db.query(
    'select id, name, phone, "group", vcard from boxes_contacts ' +
      'order by id'
  )
  return result.rows
}

async function getGroups() {
  const result = await db.query(
    'select distinct "group" from boxes_contacts order by "group" nulls first'
  )
  return result.rows.map(row => row.group)
}

async function insert(contact) {
  const {
    name, group, phone, birthday, is_birthday_estimated
  } = contact
  await db.query(
    'insert into boxes_contacts ' +
      '(name, "group", phone, birthday, is_birthday_estimated) ' +
      'values ($1, $2, $3, $4, $5)',
    [name, group, phone, birthday, is_birthday_estimated]
  )
}

async function insertViaVcard(vcardJson, batch) {
  const meta = { batch }
  await db.query(
    'insert into boxes_contacts (vcard, meta) values ($1, $2)',
    [JSON.stringify([vcardJson]), meta]
  )
}

async function getById(id) {
  const result = await db.query(
    'select id, name, phone, "group", birthday, is_birthday_estimated, ' +
      'vcard, last_updated ' +
      'from boxes_contacts ' +
      'where id = $1',
    [id]
  )
  return result.rows[0]
}

async function updateById(id, contact) {
  await db.query(
    'update boxes_contacts set ' +
      'name = $2, phone = $3, "group" = $4, ' +
      'birthday = $5, is_birthday_estimated = $6,' +
      'last_updated = $7 ' +
      'where id = $1',
    [
      id, contact.name, contact.phone, contact.group,
      contact.birthday, contact.is_birthday_estimated,
      new Date()
    ]
  )
}

async function getNextById(id) {
  const result = await db.query(
    'select id, name, phone, "group", vcard, last_updated ' +
      'from boxes_contacts ' +
      'where id > $1 ' +
      'order by id asc limit 1',
    [id]
  )
  return result.rows[0]
}

async function getPrevById(id) {
  const result = await db.query(
    'select id, name, phone, "group", vcard, last_updated ' +
      'from boxes_contacts ' +
      'where id < $1 ' +
      'order by id desc limit 1',
    [id]
  )
  return result.rows[0]
}

async function merge(primaryId, otherId) {
  const primary = await getById(primaryId)
  const other = await getById(otherId)

  // Merge
  primary.vcard.push(...other.vcard)

  // Save primary
  await db.query(
    'update boxes_contacts set vcard = $2 where id = $1',
    [primaryId, JSON.stringify(primary.vcard)]  // https://github.com/brianc/node-postgres/issues/442
  )

  // Delete the other
  await remove(otherId)
}

async function getVcard(id) {
  const result = await db.query(
    'select vcard from boxes_contacts ' +
      'where id = $1',
    [id],
  )
  return result.rows[0] && result.rows[0].vcard
}

async function remove(id) {
  await db.query(
    'delete from boxes_contacts where id = $1',
    [id]
  )
}

async function getBirthdays() {
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

module.exports = {
  list,
  getGroups,
  insert,
  insertViaVcard,
  getById,
  getNextById,
  getPrevById,
  updateById,
  merge,
  getVcard,
  remove,
  getBirthdays,
}
