const PeerInfo = require('peer-info')

const Node = require('./libp2p')
const { getNodeIPs, getPort, isValidIP } = require('./utils')
const { P2P_PORT } = require('./const')


async function createNode(options) {
  // Resolve addressing
  const ips = await getNodeIPs()
  const port = await getPort(P2P_PORT, ips)
  const peerInfo = await PeerInfo.create()

  console.log('peerInfo', peerInfo)

  ips.forEach(addr => {
    if (isValidIP(addr)) {
      const maddr = `/ip4/${addr}/tcp/${port}`
      console.log(maddr)
      peerInfo.multiaddrs.add(maddr)
    } else {
      console.debug(`Cannot use address: ${addr}`)
    }
  })

  const node = new Node({
    peerInfo,
    ...options
  })

  node.on('error', err => {
    console.error('libp2p error: ', err)
    throw err
  })

  return node
}

module.exports = createNode
