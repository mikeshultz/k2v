const Bluebird = require('bluebird')

const { PROTOCOL_ID, COMMAND_TO_BYTE } = require('./const')
//const reqMan = require('./requestManager')
const createNode = require('./createNode')
const { receive, send } = require('./protocol')
const { createLogger } = require('./log')

const log = createLogger('k2v')
const tick = (ms = 1000) => { return new Promise(resolve => { setTimeout(() => resolve(true), ms) }) }
const sendAsync = Bluebird.promisify(send)


class K2VNode {
  constructor() {
    this.node = null
    this.connManager = null
  }

  init(libp2pOptions) { //, connManagerOptions) {
    createNode(libp2pOptions).then(node => {
      log.info('Starting k2v service...')

      this.node = node
      this.addLibp2pHandlers(this.node)
      //this.connManager = this.initConnManager(connManagerOptions)
      log.info(`Listening on:`)
      this.node.peerInfo.multiaddrs.toArray().map(maddr => {
        log.info(`   ${maddr}/${this.node.peerInfo.id._idB58String}`)
      })
      
      // Callback hell
      this.node.dialProtocolAsync = Bluebird.promisify(this.node.dialProtocol)
    })
  }

  start() {
    this.node.start(err => { if (err) log.error(err) })
  }

  async startWhenReady() {
    log.debug('Waiting for node to become ready...')
    do {
      if (this.node === null) continue
      this.start()
      break
    } while (await tick())
    log.debug('Node started.')
  }

  addLibp2pHandlers(node) {
    node.on('start', () => {
      log.info('k2v started!')

      node.handle(PROTOCOL_ID, (proto, conn) => {
        receive(conn)
      })
    })

    node.once('peer:discovery', (peer) => {
      log.debug('new peer!', peer.id._idB58String)

      node.dialProtocol(peer, PROTOCOL_ID, (err, conn) => {
        if (err) {
          log.error('error making connection!')
          log.error(err)
        } else {
          log.debug('Sending ping...')
          send(conn, [COMMAND_TO_BYTE['ping']])
        }
      })
    })

    node.on('peer:connect', (peer) => {
      log.debug('new peer connected!', peer.id._idB58String)
      /*node.ping(peer, (err, time) => {
        if (err) console.error('error pinging', err)
        console.log(`pong!  ${time}`)
      })*/
    })

    node.on('peer:disconnect', (peer) => {
      log.debug('peer connection ended!', peer.id._idB58String)
    })

    node.on('connection:start', (peer) => {
      log.debug('new connection!', peer.id._idB58String)
    })

    node.on('connection:end', (peer) => {
      log.debug('connection ended!', peer.id._idB58String)
    })

    node.on('error', (err) => {
      log.error('Error in libp2p')
      throw err
    })

    node.on('stop', () => {
      log.debug('lip2p2 stopped')
    })
  }

  /**
   * Send a request to a specific peer
   * @param {string} destination peer Qm hash
   * @param {string} command hex byte
   * @param {string} arg2
   * @param {string} arg3...
   */
  async sendTo(dest, args) {
    if (dest.startsWith('Qm')) {
      dest = `/p2p-circuit/p2p/${dest}`
    }
    const conn = await this.node.dialProtocolAsync(dest, PROTOCOL_ID)
    return await sendAsync(conn, args.slice(args, 1))
  }

  /*initConnManager(options) {
    const manager = new ConnManager(node, {
      maxPeers: DEFAULT_MAX_PEERS,
      ...options
    })
    manager.emit('limit:exceeded', limitName, measured)
    manager.start()
    return manager
  }*/
}

module.exports = K2VNode
