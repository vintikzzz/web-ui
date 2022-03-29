const common = require('./webpack/common.js');

module.exports = common({
    mode: 'production',
    ssr: true,
    ssrType: 'client',
    sentry: true,
    // publicPath: 'http://publicpath/', // will be replaced as ssr
    // publicPath: 'https://static.webtor.io/',
    // publicPath: 'http://192.168.0.100:4000/',
    inject: false,
});
