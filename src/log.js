const Logger = require('logplease')
const { PROJECT_NAME } = require('./const')

function createLogger(name) {
  return Logger.create(`${PROJECT_NAME}:${name}`)
}

module.exports = {
  Logger,
  createLogger
}
