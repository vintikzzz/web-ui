const common = require('./webpack/common.js');

module.exports = common({
    mode: 'production',
    analyze: true,
    inject: true,
});
