const common = require('./webpack/common.js');

module.exports = common({
    inject: true,
    outputPattern: '[name].[hash]',
});
