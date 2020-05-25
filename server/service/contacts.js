const repo = require('../repository/contacts')

async function list() {
  return repo.selectAll()
}

async function add(contact) {
  await repo.insert(contact)
}

async function get(id) {
  return repo.selectById(id)
}

async function getVCard(id) {
  return repo.selectVCardById(id)
}

async function getNextContact(id) {
  return repo.selectNextById(id)
}

async function getPreviousContact(id) {
  return repo.selectPreviousById(id)
}

async function getAllGroups() {
  return repo.selectDistinctGroups()
}

async function getBirthdays() {
  return repo.selectBirthdays()
}

async function edit(id, contact) {
  return repo.updateById(id, contact)
}

async function remove(id) {
  return repo.deleteById(id)
}

async function importVCard(vcard, batch) {
  await repo.insert({
    vcard,
    meta: { batch }
  })
}

async function merge(primaryId, otherId) {
  const primary = await repo.selectById(primaryId)
  const other = await repo.selectById(otherId)

  // Merge
  primary.vcard.push(...other.vcard)

  // Save primary
  await repo.updateById(primaryId, primary)

  // Delete the other
  await repo.deleteById(otherId)
}

module.exports = {
  list,
  add,
  get,
  getVCard,
  getNextContact,
  getPreviousContact,
  getAllGroups,
  getBirthdays,
  edit,
  remove,
  importVCard,
  merge,
}
