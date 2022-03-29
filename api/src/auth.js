const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

module.exports = function(config, app) {
    require('./patreon')(config, app, passport);
    let cookie = null;
    if (process.env.NODE_ENV == 'production') {
        cookie = {
            path: '/',
            httpOnly: true,
            secure: true,
            maxAge: null,
            sameSite: 'none',
        }
    }
    let redis = require('./redis')();
    let store = null;
    if (redis) {
        store = new RedisStore({ client: redis });
    }
    app.use(session({
        secret: config.session !== undefined ? config.session.secret : '4e529b35ae4125ef376f79e52adb0f27',
        store,
        cookie,
        resave: false,
        saveUninitialized: true,
    }));
    app.use(passport.initialize());
    app.use(passport.session());
}