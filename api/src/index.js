process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err + ' stack:' + err.stack);
});
const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');
const outputPath = path.resolve(__dirname, '../../ui/dist');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const YAML = require('yaml');
const fs = require('fs');
const getIp = require('./ip');

let configPath = './config.yaml';
if (process.env.WEBTOR_WEB_UI_CONFIG) {
  configPath = process.env.WEBTOR_WEB_UI_CONFIG;
}

let config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

// To support helmfile's webtor ui config file
if (config.config) {
  config = config.config;
}

const app = express();
app.set('etag', false);
morgan.token('remote-addr', (req) => {
  return getIp(req);
})
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ":referrer" ":user-agent"'));
app.use(compression());
app.use(express.static(outputPath, {
  index: false,
  immutable: true,
  maxAge: 365 * 24 * 60 * 60 * 1000,
  cacheControl: true,
  setHeaders: function(res, path) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.enable('trust proxy');

app.use((req, res, next) => {
  let refDomain = false;
  if (req.headers.referer) {
      let u = new URL(req.headers.referer);
      refDomain = u.hostname;
  }
  if (!refDomain && req.headers.host) {
      let u = new URL('http://' + req.headers.host);
      refDomain = u.hostname;
  }
  req.refDomain = refDomain ? refDomain : 'default';
  next();
})
app.use((req, res, next) => {
  let defSdk = {};
  if (req.headers.host !== undefined) {
    const url = new URL('http://' + req.headers.host);
    defSdk.apiUrl = req.protocol + '://' + url.hostname + ':30180';
  }

  req.config = {
    sdk: config.sdk !== undefined ? Object.assign(defSdk, config.sdk) : defSdk,
    ga: config.ga !== undefined ? config.ga : false,
    adsense: config.adsense !== undefined ? config.adsense : false,
    adScripts: config.adScripts !== undefined ? config.adScripts : [],
    stoplist: config.stoplist !== undefined ? config.stoplist : [],
  };
  next();
})

require('./auth')(config, app);
require('./adstxt')(config, app);
require('./ads')(config, app);
require('./token')(config, app);
require('./inject')(config, app);


app.use(history({index: '/'}));

if (process.env.NODE_ENV == 'development') {
  require('./hotreload')(config, app);
} else {
  require('./ssr')(config, app, {outputPath});
}

const port = 4000;

app.listen(port, () => console.log(`Webtor.io listening ${process.env.NODE_ENV} on port ${port}!`));

var https = require('https');
const httpsPort = port + 1;
https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
.listen(httpsPort, function () {
  console.log(`Webtor.io listening https ${process.env.NODE_ENV} on port ${httpsPort}!`)
})