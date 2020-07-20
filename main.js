const express = require('express')
const cookieSession = require('cookie-session')
const passport = require('@passport-next/passport')

const SlackAuth = require('./src/slack-auth')
const unleash = require('./src/unleash')
const allFlags = require('./src/all-flags')

const app = express()

async function main() {
    app.use(cookieSession({
        name: 'flags-session',
        secret: process.env.SESSION_SECRET,
        maxAge: 24 * 60 * 60 * 1000
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(SlackAuth(passport))

    app.use('/unleash', await unleash())
    app.use('/v1/flags', allFlags())
    app.use('/', (_, res) => res.redirect('/unleash/'))
    
    app.all('*', () => {
        throw new NotFound()
    })
    
    app.listen(process.env.PORT)
}
main()