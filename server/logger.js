const bunyan = require("bunyan")
const logger = bunyan.createLogger({
  name: "boxes/server"
})

if (process.env.NODE_ENV === "test") {
  logger.level(bunyan.FATAL + 1)
}

module.exports = logger;
