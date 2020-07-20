const { initialize } = require('unleash-client');
const fetch = require('node-fetch')

const allFlagsClient = () => {
    const instance = initialize({
        url: `http://localhost:${process.env.PORT}/unleash/api`,
        appName: 'feature-flagging',
        instanceId: 'feature-flagging',
    });

    instance.on('error', err => console.log('ERROR_UNLEASH_CLIENT', err))
    
    return (req, res) => {
        const context = {
            sessionId: req.headers['session'] || 'unknown'
        }
        const flags = instance.getFeatureToggleDefinitions().map(
            feature => ({
                name: feature.name,
                description: feature.description,
                createdAt: feature.createdAt,
                defaultState: feature.enabled,
                state: instance.isEnabled(feature.name, context),
                variant: instance.getVariant(feature.name, context)
            })
        )
        res.json(flags).end()
        
    }
}
module.exports = allFlagsClient