const os = require('os')
const ip = require('ip')
const fetch = require('node-fetch')
const tcpPortUsed = require('tcp-port-used')

const { EXTERNAL_IP_RESOLVER } = require('../const')
const { createLogger } = require('../log')

const log = createLogger('requrest')


async function getPort(startPort, ips) {
  let portFound = false
  let port = startPort
  do {
    const validIPs = ips.filter(addr => isValidIP(addr))
    const anyInUse = await Promise.all(validIPs.map(addr => tcpPortUsed.check(port, addr)))
    const portInUse = anyInUse.some(v => v === true)
    if (portInUse) {
      port += 1
    } else {
      portFound = true
    }
  } while (!portFound)
  return port
}

function isValidIP(addr) {
  return ip.isV4Format(addr) // TODO: ipv6 throws error? || ip.isV6Format(addr)
}

async function getExternalIP() {
  const res = await fetch(EXTERNAL_IP_RESOLVER)
  if (res.status !== 200) return
  return res.text()
}

async function getNodeIPs() {
  const ifaces = os.networkInterfaces()
  const ips = []
  let hasExternal = false
  Object.keys(ifaces).forEach(name => {
    ifaces[name].forEach(iface => {
      const addr = iface.address
      if (!ip.isPrivate(addr)) hasExternal = true
      ips.push(addr)
    })
  })
  ips.push('0.0.0.0')
  if (hasExternal) log.debug('Has external IP')
  /**
   * TODO appears it tries to listen, don't use
  if (!hasExternal) {
    const externalIP = await getExternalIP()
    if (isValidIP(externalIP)) {
      ips.push(externalIP)
    } else {
      console.warn(`did not find an external address`)
    }
  }*/
  return ips
}

module.exports = {
  getPort,
  isValidIP,
  getExternalIP,
  getNodeIPs
}
