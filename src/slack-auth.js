const {Router} = require('express')
const {User} = require('unleash-server')

const OAuth2Strategy = require('@passport-next/passport-oauth2')
const fetch = require('node-fetch')

const withoutBotScope = params => {
    params.granular_bot_scope = false
    return params
}

function SlackAuth(passport) {
    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))

    app = new Router()
    const slack = new OAuth2Strategy({
            authorizationURL: 'https://slack.com/oauth/authorize',
            tokenURL: 'https://slack.com/api/oauth.access',
            clientID: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
            callbackURL: process.env.SLACK_CALLBACK_URL,
            scope: ['identity.basic', 'identity.email']
        },
        (accessToken, refreshToken, profile, verified) => {
            return verified(null, new User({
                name: profile.user.name,
                email: profile.user.email,
            }))
        }
    )
    slack.authorizationParams = withoutBotScope
    slack.tokenParams = withoutBotScope
    slack.userProfile = function(accessToken, done) {
        return fetch(`https://slack.com/api/users.identity?token=${accessToken}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(res.statusCode, res)
                }
                return res.json()
            })
            .then(res => {
                if (res.error) {
                    throw new Error(res.error, res)
                }
                return done(null, res)
            })
            .catch(err => {
                console.error('ERROR_USER_PROFILE', err)
                done(err)
            })
    }
    passport.use('slack', slack)
    app.get(
        '/auth/login', passport.authenticate('slack')
    )
    app.get('/auth/callback', passport.authenticate('slack', {
        failureRedirect: '/auth/login',
    }), (_, res) => {
        return res.redirect('/')
    })

    return app
}


module.exports = SlackAuth