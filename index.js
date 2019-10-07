const K2VNode = require('./src/k2v')
const { createServer } = require('./src/http')
const { createLogger } = require('./src/log')

const log = createLogger('main')

async function main() {
  const options = {}

  // TODO: Use real cli processing here?
  if (process.argv.length > 2) {
    /*const bootStrapOptions = {
      list: process.argv.slice(2),
      interval: 5000
    }*/
    options.bootstrapList = process.argv.slice(2) // new Bootstrap(bootStrapOptions)
  }
  
  const node = new K2VNode()
  node.init(options)
  node.startWhenReady()

  // HTTP server
  log.info('Starting HTTP server...')
  expressApp = await createServer({ port: 7700 }, node)
  log.info('HTTP server started.')
}

if (require.main === module) {
  main()
} else {
  module.exports = main
}
