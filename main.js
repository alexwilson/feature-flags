const express = require('express')
const cookieSession = require('cookie-session')
const passport = require('@passport-next/passport')

const SlackAuth = require('./src/slack-auth')
const unleash = require('./src/unleash')
const allFlags = require('./src/all-flags')

const app = express()

const redirectTo = destination => (req, res) => res.redirect(destination)

async function main() {
    app.use(cookieSession({
        name: 'flags-session',
        secret: process.env.SESSION_SECRET,
        maxAge: 24 * 60 * 60 * 1000
    }))

    // Internal authorization routes
    app.use(passport.initialize())
    app.use(passport.session())
    app.use('/auth', SlackAuth(passport))


    // Unleash API routes
    app.use('/unleash', await unleash())
    // Send legacy clients to the right place.
    app.use('/client/features', redirectTo('/unleash/api/client/features'))


    // Flags API routes
    app.use('/v1/flags', allFlags())


    // Doc pages & catch-all error pages.
    app.use('/', redirectTo('/v1/flags'))
    app.all('*', () => {
        throw new NotFound()
    })

    
    app.listen(process.env.PORT)
}
main()