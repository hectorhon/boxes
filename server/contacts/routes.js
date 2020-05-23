const express = require('express')

const repo = require('./repository')

const router = express.Router()

function removePhotoFromVcard(vcard) {
  if (Array.isArray(vcard)) {
    vcard.forEach(v => {
      for (let key in v) {
        if (key.indexOf('PHOTO') >= 0) {
          delete v[key]
        }
      }
    })
  }
}

function wrap(asyncFunction) {
  return ((req, res) => {
    asyncFunction(req, res).catch(err => {
      if (process.env.NODE_ENV) {
        res.status(500).end()
      } else {
        res.status(500).send(err.toString())
      }
    })
  })
}

router.get('/contacts', wrap(async (req, res) => {
  const contacts = await repo.list()
  contacts.forEach(contact => removePhotoFromVcard(contact.vcard))
  res.render('contacts/views/list', {
    title: 'Contacts',
    contacts,
  })
}))

router.get('/contacts/edit', wrap(async (req, res) => {
  const { id } = req.query
  const contact = await repo.getById(id)
  if (!contact) {
    res.status(404).send('Contact not found')
    return
  }
  const nextContact = await repo.getNextById(id)
  const prevContact = await repo.getPrevById(id)
  const groups = await repo.getGroups()
  res.render('contacts/views/edit', {
    title: 'Contacts - Edit',
    contact,
    nextContact,
    prevContact,
    groups,
  })
}))

router.post('/contacts/edit', wrap(async (req, res) => {
  const { id } = req.query
  const {
    name, group, newGroup, phone,
    birthday, is_birthday_estimated,
    nextId, saveAndNext
  } = req.body
  await repo.updateById(id, {
    name,
    group: group || (newGroup ? newGroup : null),
    phone,
    birthday: birthday ? birthday : null,
    is_birthday_estimated: is_birthday_estimated === 'on',
  })
  if (saveAndNext) {
    res.redirect(`/contacts/edit?id=${nextId}`)
  } else {
    res.redirect(`/contacts/edit?id=${id}`)
  }
}))

router.get('/contacts/new', wrap (async (req, res) => {
  const groups = await repo.getGroups()
  res.render('contacts/views/new', {
    title: 'Contacts - New',
    groups,
  })
}))

router.post('/contacts/new', wrap (async (req, res) => {
  const {
    name, group, newGroup, phone, birthday, is_birthday_estimated
  } = req.body
  await repo.insert({
    name,
    group: group || (newGroup ? newGroup : null),
    phone,
    birthday: birthday ? birthday : null,
    is_birthday_estimated: is_birthday_estimated === 'on',
  })
  res.redirect('/contacts')
}))

router.post('/api/contacts/newVcard', wrap(async (req, res) => {
  const { batch } = req.query
  if (!batch) {
    res.status(400).send('Missing "batch" query string parameter')
    return
  }
  const vcardJson = req.body
  await repo.insertViaVcard(vcardJson, batch)
  res.status(200).end()
}))

router.get('/contacts/merge', wrap(async (req, res) => {
  const { primary: primaryContactId, other: otherContactId } = req.query
  let primaryContactVcard, otherContactVcard
  if (primaryContactId) {
    primaryContactVcard = await repo.getVcard(primaryContactId)
    removePhotoFromVcard(primaryContactVcard)
  }
  if (otherContactId) {
    otherContactVcard = await repo.getVcard(otherContactId)
    removePhotoFromVcard(otherContactVcard)
  }
  res.render('contacts/views/merge', {
    title: 'Contacts - Merge vcard',
    primaryContactId,
    otherContactId,
    primaryContactVcard,
    otherContactVcard,
  })
}))

router.post('/contacts/merge', wrap(async (req, res) => {
  const { primaryContactId, otherContactId } = req.body
  await repo.merge(primaryContactId, otherContactId)
  res.redirect(`/contacts/edit?id=${primaryContactId}`)
}))

router.get('/contacts/delete', wrap(async (req, res) => {
  const { id } = req.query
  const contact = await repo.getById(id)
  if (!contact) {
    res.status(404).send('Contact not found')
    return
  }
  res.render('contacts/views/delete', {
    title: 'Contacts - Delete',
    contact,
  })
}))

router.post('/contacts/delete', wrap(async (req, res) => {
  const { id } = req.body
  const prevContact = await repo.getPrevById(id)
  await repo.remove(id)
  res.redirect(`/contacts/edit?id=${prevContact.id}`)
}))

router.get('/api/contacts/vcard', wrap(async (req, res) => {
  const { id } = req.query
  const vcard = await repo.getVcard(id)
  removePhotoFromVcard(vcard)
  res.json(vcard)
}))

router.get('/contacts/birthdays', wrap(async (req, res) => {
  const birthdays = await repo.getBirthdays()
  res.render('contacts/views/birthdays', {
    title: 'Birthdays',
    birthdays,
  })
}))

module.exports = router
