const invert = require('lodash/invert')

const PROJECT_NAME = 'k2v'
const BYTE_TO_COMMAND = {
  '00': 'ping',
  '01': 'pong',
}

module.exports = {
  PROJECT_NAME,
  PROTOCOL_ID: `/${PROJECT_NAME}/1.0.0`,
  P2P_PORT: 7755,
  COMMAND_BYTE_LENGTH: 1,
  DEFAULT_MAX_PEERS: 25,
  MAX_DATA_LEN: 1024,
  BYTE_TO_COMMAND,
  COMMAND_TO_BYTE: invert(BYTE_TO_COMMAND),
  EXTERNAL_IP_RESOLVER: process.env.EXTERNAL_IP_RESOLVER || 'https://ifconfig.me/ip',
  INTERNAL_PATTERNS: [/^10\./, /^192\.168\./],
}
