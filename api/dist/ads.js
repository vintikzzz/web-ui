"use strict";

const URL = require('url').URL;

const {
  roles
} = require('./roles');

module.exports = function (config, app) {
  app.use((req, res, next) => {
    if (config.ads === undefined) {
      req.config.ads = false;
      next();
      return;
    }

    const d = config.ads.whitelist.find(e => {
      return req.refDomain.includes(e);
    });
    let ads = true;
    if (d) ads = false;
    if (req.user && req.user.role != roles.NOBODY) ads = false;
    req.config.ads = ads;
    next();
  });
};