const { Pool, types } = require('pg')

// node-postgres library parses YYYY-MM-DD returned from database
// queries as new Date(YYYY, MM, DD) which converts it to local
// time. I don't want this behaviour. Since JavaScript doesn't have
// date only types, best thing to do is to return the date as a
// string.
types.setTypeParser(1082, function(str) {
  return str
})

const pool = new Pool({
  host: '/var/run/postgresql',
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}
