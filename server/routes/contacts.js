const express = require('express')

const contacts = require('../service/contacts')

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

router.get('/contacts', wrap(async (_, res) => {
  const list = await contacts.list()
  list.forEach(contact => removePhotoFromVcard(contact.vcard))
  res.render('contacts/list', {
    title: 'Contacts',
    contacts: list,
  })
}))

router.get('/contacts/edit', wrap(async (req, res) => {
  const { id } = req.query
  const contact = await contacts.get(id)
  if (!contact) {
    res.status(404).send('Contact not found')
    return
  }
  const nextContact = await contacts.getNextContact(id)
  const prevContact = await contacts.getPreviousContact(id)
  const groups = await contacts.getAllGroups()
  res.render('contacts/edit', {
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
  await contacts.edit(id, {
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
  const groups = await contacts.getAllGroups()
  res.render('contacts/new', {
    title: 'Contacts - New',
    groups,
  })
}))

router.post('/contacts/new', wrap (async (req, res) => {
  const {
    name, group, newGroup, phone, birthday, is_birthday_estimated
  } = req.body
  await contacts.add({
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
  await contacts.importVCard(vcardJson, batch)
  res.status(200).end()
}))

router.get('/contacts/merge', wrap(async (req, res) => {
  const { primary: primaryContactId, other: otherContactId } = req.query
  let primaryContactVcard, otherContactVcard
  if (primaryContactId) {
    primaryContactVcard = await contacts.getVCard(primaryContactId)
    removePhotoFromVcard(primaryContactVcard)
  }
  if (otherContactId) {
    otherContactVcard = await contacts.getVCard(otherContactId)
    removePhotoFromVcard(otherContactVcard)
  }
  res.render('contacts/merge', {
    title: 'Contacts - Merge vcard',
    primaryContactId,
    otherContactId,
    primaryContactVcard,
    otherContactVcard,
  })
}))

router.post('/contacts/merge', wrap(async (req, res) => {
  const { primaryContactId, otherContactId } = req.body
  await contacts.merge(primaryContactId, otherContactId)
  res.redirect(`/contacts/edit?id=${primaryContactId}`)
}))

router.get('/contacts/delete', wrap(async (req, res) => {
  const { id } = req.query
  const contact = await contacts.get(id)
  if (!contact) {
    res.status(404).send('Contact not found')
    return
  }
  res.render('contacts/delete', {
    title: 'Contacts - Delete',
    contact,
  })
}))

router.post('/contacts/delete', wrap(async (req, res) => {
  const { id } = req.body
  const prevContact = await contacts.getPreviousContact(id)
  await contacts.remove(id)
  if (prevContact) {
    res.redirect(`/contacts/edit?id=${prevContact.id}`)
  } else {
    res.redirect('/contacts')
  }
}))

router.get('/api/contacts/vcard', wrap(async (req, res) => {
  const { id } = req.query
  const vcard = await contacts.getVCard(id)
  removePhotoFromVcard(vcard)
  res.json(vcard)
}))

router.get('/contacts/birthdays', wrap(async (req, res) => {
  const birthdays = await contacts.getBirthdays()
  res.render('contacts/birthdays', {
    title: 'Birthdays',
    birthdays,
  })
}))

module.exports = router
