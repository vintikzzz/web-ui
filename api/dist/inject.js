"use strict";

const JavaScriptObfuscator = require('javascript-obfuscator');

const sha1 = require('sha1'); // https://stackoverflow.com/a/1349426


function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

module.exports = function (config, app) {
  app.use((req, res, next) => {
    if (!req.query.id) {
      req.injectCode = '';
      req.injectHash = '';
      next();
      return;
    }

    const rand = makeid(32);
    const id = req.query.id;
    let injectCode = `
            var found = false;
            var scripts = document.getElementsByTagName('script');
            for (var i = scripts.length; i--;) {
                if (scripts[i].src.includes('https://cdn.jsdelivr.net/npm/@webtor/')) {
                    found = '${rand}';
                }
            }
            var f = window.frames['webtor-${id}'];
            f.contentWindow.postMessage({id: '${id}', name: 'check', data: found}, '*');
        `;
    injectCode = JavaScriptObfuscator.obfuscate(injectCode, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    }).getObfuscatedCode();
    req.injectCode = injectCode;
    req.injectHash = sha1(rand);
    next();
  });
};