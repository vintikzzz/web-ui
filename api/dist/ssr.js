"use strict";

const fs = require('fs-extra');

const debug = require('debug')('webtor:ssr');

const locale = require('locale');

const dontPrefetch = ['iframeResizer.contentWindow.min.js', 'sandblaster.min.js', 'hls.min.js'];

module.exports = function (config, app, {
  outputPath
}) {
  const createRenderer = (bundle, options) => {
    // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
    return require('vue-server-renderer').createBundleRenderer(bundle, Object.assign(options, {
      // template,
      cache: require('lru-cache')({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false
    }));
  };

  function createProdRenderer(app) {
    const bundle = require(`${outputPath}/vue-ssr-server-bundle.json`);

    const clientManifest = require(`${outputPath}/vue-ssr-client-manifest.json`);

    const template = fs.readFileSync(`${outputPath}/index.html`, 'utf-8'); // console.log(bundle);
    // console.log(clientManifest);

    return new Promise(function (resolve, reject) {
      resolve(createRenderer(bundle, {
        template,
        clientManifest,

        shouldPrefetch(file, type) {
          if (dontPrefetch.includes(file)) return false;
          return true;
        }

      }));
    });
  }

  const initRenderer = createProdRenderer(app);

  async function render(app, context, hostname) {
    const renderer = await initRenderer;
    return new Promise(function (resolve, reject) {
      renderer.renderToString(context, (err, html) => {
        if (err) {
          reject(err);
        } else {
          resolve(html);
        }
      });
    });
  }

  app.use(async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const locales = new locale.Locales(req.headers['accept-language']);
    const hostname = req.headers.host;
    const context = {
      url: req.originalUrl,
      locales,
      user: req.user,
      token: req.token,
      injectHash: req.injectHash,
      injectCode: req.injectCode,
      config: req.config
    };

    try {
      const r = await render(app, context, hostname);
      res.end(r);
    } catch (err) {
      // console.log(err);
      if (err.code == 404) {
        res.sendStatus(404);
      } else {
        console.log(err);
        console.log(err.stack);
        res.status(500).send(err + "\n" + err.stack);
      }
    }
  });
};