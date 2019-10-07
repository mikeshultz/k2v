const express = require('express')

const { COMMAND_TO_BYTE } = require('./const')
const { getNodeIPs, getPort } = require('./utils/net')
const { createLogger } = require('./log')

const log = createLogger('http')


async function createServer(options, k2vnode) {
  const app = express()
  const ips = await getNodeIPs()
  const port = await getPort(options.port || 3000, ips)

  app.get('/', (req, res) => res.send('Hello World!'))
  app.get('/ping/:dest', async (req, res) => {
    const dest = req.params.dest
    try {
      const resp = await k2vnode.sendTo(dest, [COMMAND_TO_BYTE['ping']])
      res.send(resp)
    } catch (err) {
      res.send(err.message)
    }
  })

  app.listen(port, () => log.info(`HTTP server listening on port ${port}!`))

  return app
}

module.exports = {
  createServer,
}
