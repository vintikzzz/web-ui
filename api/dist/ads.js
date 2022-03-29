"use strict";

const URL = require('url').URL;

module.exports = function (config, app) {
  app.use((req, res, next) => {
    if (config.ads === undefined) {
      req.config.ads = false;
      next();
      return;
    }

    let refDomain = false;

    if (req.headers.referer) {
      let u = new URL(req.headers.referer);
      refDomain = u.hostname;
    }

    if (!refDomain && req.headers.host) {
      let u = new URL('http://' + req.headers.host);
      refDomain = u.hostname;
    }

    refDomain = refDomain ? refDomain : 'default';
    const d = config.ads.whitelist.find(e => {
      return refDomain.includes(e);
    });
    let ads = true;
    if (d) ads = false;
    if (req.user && req.user.role != roles.NOBODY) ads = false;
    req.config.ads = ads;
    next();
  });
};