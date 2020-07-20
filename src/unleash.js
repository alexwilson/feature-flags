const unleashServer = require('unleash-server')
const unleashSlackAuth = require('./unleash/slack')

async function unleash(options) {
    const defaultOptions = {
        databaseUrl: process.env.DATABASE_URL,
        serverMetrics: true,
        ui: {
            headerBackground: '#771C13'
        },
        adminAuthentication: 'custom',
        preRouterHook: unleashSlackAuth
    }
    const {app} = await unleashServer.create(Object.assign({}, defaultOptions, options))
    return app
}


module.exports = unleash