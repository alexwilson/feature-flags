const {AuthenticationRequired} = require('unleash-server')
  
function unleashSlackAuth(app) {
    app.use('/api/admin/', (req, res, next) => {
        if (!req.user) {
            return res
                .status('401')
                .json(
                new AuthenticationRequired({
                    path: '/auth/login',
                    type: 'custom',
                    message: `You have to identify yourself in order to use Unleash. Click the button and follow the instructions.`,
                }),
                )
        }
        return next()
    })
}
  
  module.exports = unleashSlackAuth