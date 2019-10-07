const { COMMAND_BYTE_LENGTH, COMMAND_TO_BYTE } = require('../const')
const { createLogger } = require('../log')

const request = require('./request')

const log = createLogger('handlers')

function handlePing(data) {
  if (data.length === 0) {
    throw new Error('Ping should have data')
  }
  log.debug('handlePing data', parseInt(data.toString('hex'), 16))
  const sent = parseInt(data.toString('hex'), 16)
  const now = +new Date()
  const diff = now - sent
  log.debug(`${now} - ${sent} = ${diff}`)
  log.info(`ping received in ~${diff/1000}s`)
  return request(COMMAND_TO_BYTE['pong'], data)
}

function handlePong(data) {
  log.debug('handlePong()')
  log.debug('handlePong data', data)
  const sent = +new Date(parseInt(data.toString('hex'), 16))
  const now = +new Date()
  const diff = now - sent
  let logFunc = log.debug
  if (diff > 5000) logFunc = log.warn
  else if (diff > 1000) logFunc = log.info
  logFunc(`ping round trip time ${diff}ms`)
}

const COMMAND_HADLERS = {
  '00': handlePing,
  '01': handlePong,
}

function splitData(data) {
  return {
    cmd: data.subarray(0, COMMAND_BYTE_LENGTH).toString('hex'),
    data: data.subarray(COMMAND_BYTE_LENGTH)
  }
}

function handler(dat) {
  const { cmd, data } = splitData(dat)
  return COMMAND_HADLERS[cmd](data)
}

module.exports = handler
