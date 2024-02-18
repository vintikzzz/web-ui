const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const jp = require('jsonpath');
const querystring = require('querystring');
const request = require('request');
const { roles } = require('./roles');

function makeUser(d, patreonCampaignId, patreonRoles) {
    const user = {
        id: d.data.id,
        firstName: d.data.attributes.first_name,
        lastName: d.data.attributes.last_name,
        email: d.data.attributes.email,
        role: roles.NOBODY,
    };

    const tierIds = jp.query(d, `$.included[?(@.type=="member" && @.relationships.campaign.data.id == "${patreonCampaignId}")].relationships.currently_entitled_tiers..id`);
    for (const [role, id] of Object.entries(patreonRoles)) {
        if (tierIds.includes(id)) user.role = role;
    }

    const lastChargeStatus = jp.value(d, `$.included[?(@.type=="member" && @.relationships.campaign.data.id == "${patreonCampaignId}")].attributes.last_charge_status`);
    if (lastChargeStatus && lastChargeStatus !== 'Paid') {
        user.role = roles.NOBODY;
    }

    const isCreator = jp.value(d, `$.included[?(@.type=="campaign" && @.id == "${patreonCampaignId}")].relationships.creator.data.id`) == user.id;
    if (isCreator) {
        user.role = roles.SPARKLING_CREATOR;
    }

    return user;
}


module.exports = function (config, app, passport) {
    app.use((req, res, next) => {
        req.config.patreon = config.patreon !== undefined;
        next();
    });
    if (config.patreon === undefined) return;
    const baseUrl = 'https://' + config.patreon.host;
    let callbackHost = 'http://localhost:4000';
    if (process.env.NODE_ENV == 'production') {
        callbackHost = `https://${config.domain}`;
    }
    const patreonCampaignId = config.patreon.campaignId;
    const patreonTiers = [roles.BRONZE_BACKER, roles.SILVER_BACKER, roles.GOLD_BACKER, roles.EMERALD_SPONSOR, roles.RUBY_SPONSOR];
    const patreonRoles = {}
    for (let i = 0; i < config.patreon.tiers.length; i++) {
        patreonRoles[patreonTiers[i]] = config.patreon.tiers[i];
    }
    passport.use('patreon', new OAuth2Strategy({
        authorizationURL: baseUrl + '/oauth2/authorize',
        tokenURL: baseUrl + '/api/oauth2/token',
        clientID: 'vj5NkNm-NasUmyJZ5uSpY7QjAPHR2_Eh8d9bNb306GeQQzd5ZYRCkpDQhBdeGYnh',
        clientSecret: '9rwdgzd9EaqesXKVZo2J-4BdD8gMkEk_FH4eS4WY-Xu_C65L63tYqNLuGfXbuZvT',
        callbackURL: callbackHost + '/auth/patreon/callback',
    },
        function (accessToken, refreshToken, profile, done) {
            const params = {
                include: ['memberships.campaign', 'memberships.currently_entitled_tiers', 'campaign.creator'].join(','),
                'fields[user]': ['email', 'first_name', 'last_name'].join(','),
                'fields[member]': ['last_charge_status'].join(','),
            };
            const url = baseUrl + '/api/oauth2/v2/identity?' + querystring.stringify(params);
            request({
                url,
                auth: {
                    'bearer': accessToken
                }
            }, function (err, res) {
                if (err !== null) {
                    done(err, {});
                }
                const d = JSON.parse(res.body);
                console.log('patreon json body', res.body);
                const user = makeUser(d, patreonCampaignId, patreonRoles);
                console.log('patreon user', user);
                done(null, user);
            });
        }));
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (id, done) {
        done(null, id);
    });
}
