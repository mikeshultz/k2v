const Libp2p = require('libp2p')
const Ping = require('libp2p/src/ping')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Bootstrap = require('libp2p-bootstrap')
const spdy = require('libp2p-spdy')
const KadDHT = require('libp2p-kad-dht')
const mplex = require('libp2p-mplex')
//const secio = require('libp2p-secio')

const { createLogger } = require('./log')

const log = createLogger('libp2p')


function mapMuxers (list) {
  return list.map((pref) => {
    if (typeof pref !== 'string') {
      return pref
    }
    switch (pref.trim().toLowerCase()) {
      case 'spdy': return spdy
      case 'mplex': return mplex
      default:
        throw new Error(pref + ' muxer not available')
    }
  })
}

function getMuxers (muxers) {
  const muxerPrefs = process.env.LIBP2P_MUXER
  if (muxerPrefs && !muxers) {
    return mapMuxers(muxerPrefs.split(','))
  } else if (muxers) {
    return mapMuxers(muxers)
  } else {
    return [mplex, spdy]
  }
}

class Node extends Libp2p {
  constructor(_options) {
    const options = {
      peerInfo: _options.peerInfo,
      modules: {
        transport: [
          TCP,
          WS
        ],
        streamMuxer: getMuxers(_options.muxer),
        connEncryption: undefined, // TODO: Why isn't secio working? [ secio ],
        peerDiscovery: [
          MulticastDNS,
          Bootstrap
        ],
        dht: KadDHT
      },
      config: {
        peerDiscovery: {
          mdns: {
            interval: 10000,
            enabled: true
          },
          bootstrap: {
            interval: 10000,
            enabled: _options.bootstrapList && _options.bootstrapList.length > 0,
            list: _options.bootstrapList
          }
        },
        dht: {
          kBucketSize: 20
        }
      }
    }

    super({
      ...options
    })

    this.knownPeers = {}

    /**
     * event handlers
     */
    this.on('peer:discovery', (peer) => {
      if (!this.knownPeers[peer.id._idB58String]) {
        log.debug('New peer found:', peer.id._idB58String)
        this.knownPeers[peer.id._idB58String] = peer
      }
    })
  }

  ping(remotePeerInfo, callback) {
    log.debug('libp2p.ping...')
    const p = new Ping(this._switch, remotePeerInfo)
    p.on('ping', time => {
      p.stop() // stop sending pings
      callback(null, time)
    })
    p.on('error', callback)
    p.start()
  }
}

module.exports = Node