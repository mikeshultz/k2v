const pull = require('pull-stream')
const Pushable = require('pull-pushable')

const { MAX_DATA_LEN } = require('../const')
const { createLogger } = require('../log')
const handler = require('./handlers')
const request = require('./request')

const log = createLogger('protocol')
const p = Pushable()

function handleIncoming(data) {
  if (data.length > MAX_DATA_LEN) throw new Error('Data length to long!')
    console.log('idata len:', data.length)
    if (data.length > 0) {
      const response = handler(data)
      if (response) {
        log.debug('Sending response...')
        p.push(response)
        log.debug('Sent.')
      }
    }
}

/**
 * Handle incoming data
 */
function receive(conn) {
  log.debug('Incoming data...')
  pull(p, conn)
  pull(
    conn,
    pull.drain((data) => {
      handleIncoming(data)
    })
  )
}

/**
 * Send outgoing data
 * @param {Connection} the libp2p connection
 * @param {string} command byte in hex
 * @param {string} data (multiple? TODO)
 */
function send(conn) {
  pull(p, conn)
  const data = request.apply(null, Array.prototype.slice.call(arguments, 1))
  log.debug('sending data...', data)
  p.push(data)
  log.debug('Sent.')

  log.debug('Checking for an immediate response...')
  pull(
    conn,
    pull.drain((data) => {
      handleIncoming(data)
    })
  )
}

module.exports = {
  receive,
  send
}
