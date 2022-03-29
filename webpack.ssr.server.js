const common = require('./webpack/common.js');
const nodeExternals = require('webpack-node-externals');

module.exports = common({
    mode: 'production',
    ssr: true,
    ssrType: 'server',
    devTool: 'none',
    target: 'node',
    entry: './ui/src/server.js',
    libraryTarget: 'commonjs2',
    externals: nodeExternals({
        whitelist: [/\.css$/, /^vue-awesome/],
    }),
    inject: false,
});