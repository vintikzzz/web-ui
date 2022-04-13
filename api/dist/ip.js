"use strict";

module.exports = function getIp(req) {
  let ip = null;

  if (req.headers['cf-connecting-ip'] != undefined) {
    ip = req.headers['cf-connecting-ip'];
  } else if (req.headers['x-forwarded-for'] != undefined) {
    ip = req.headers['x-forwarded-for'];
  } else {
    ip = req.connection.remoteAddress;
  }

  ip = ip.split(',')[0];
  return ip;
};