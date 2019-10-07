const { createLogger } = require('../log')

const { COMMAND_TO_BYTE } = require('../const')

const log = createLogger('requrest')

/**
 * Left-pad a hex string to the byte so Buffer doesn't truncate
 */
function padHex(str) {
  return str.length % 2 === 0 ? str : '0' + str
}

/**
 * Assemble a command + payload from hex strings
 */
function assemble(cmdByte, data) {
  if (data instanceof Buffer) data = data.toString('hex')
  return `${cmdByte}${padHex(data)}`
}

/**
 * Create a ping request
 */
function makePing() {
  log.debug('makePing()')
  const dateHex = (+new Date()).toString(16)
  log.debug('makePing() dateHex', dateHex)
  return assemble(COMMAND_TO_BYTE['ping'], dateHex)
}

/**
 * Create a pong request
 */
function makePong(data) {
  log.debug('makePong()', data)
  return assemble(COMMAND_TO_BYTE['pong'], data)
}

const COMMAND_BUILDERS = {
  '00': makePing,
  '01': makePong,
}

/**
 * Create a request
 * @param {string} command hex byte
 * @param {string} arg1
 * @param {string} arg2
 * @param {string} arg3...
 */
function makeRequest() {
  const cmd = arguments[0]
  if (!Object.prototype.hasOwnProperty.call(COMMAND_BUILDERS, cmd)) {
    throw new Error(`No repsonse builders for command (${cmd})`)
  }
  const reqBuf = new Buffer.from(COMMAND_BUILDERS[cmd].apply(null, Array.prototype.slice.call(arguments, 1)), 'hex')
  console.log('reqBuf', reqBuf)
  return reqBuf
}

module.exports = makeRequest
