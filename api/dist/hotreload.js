"use strict";

module.exports = function (_, app) {
  const webpack = require('webpack');

  const config = require('../../webpack.dev.js');

  const compiler = webpack(config); // console.log(config.plugins);
  // Tell express to use the webpack-dev-middleware and use the webpack.config.js
  // configuration file as a base.

  app.use(require('webpack-dev-middleware')(compiler, {
    compress: true,
    publicPath: config.output.publicPath,
    serverSideRender: true,
    index: false
  }));
  app.use((req, res, next) => {
    if (req.url == '/__webpack_hmr') {
      return next();
    }

    res.setHeader('Cache-Control', 'no-store');
    const lfs = res.locals.fs;
    let template = lfs.readFileSync(config.output.path + '/index.html', 'utf8');
    template = template.replace('{{{ user }}}', JSON.stringify(req.user));
    template = template.replace('{{{ token }}}', req.token);
    template = template.replace('{{{ JSON.stringify(injectCode) }}}', JSON.stringify(req.injectCode));
    template = template.replace('{{{ injectHash }}}', req.injectHash);
    template = template.replace('{{{ Buffer.from(JSON.stringify(config)).toString(\'base64\') }}}', Buffer.from(JSON.stringify(req.config)).toString('base64'));
    res.send(template);
    next();
  });
  app.use(require('webpack-hot-middleware')(compiler));
};