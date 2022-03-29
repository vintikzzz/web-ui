const SitemapPlugin = require('sitemap-webpack-plugin').default;
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const marked = require('marked');
const renderer = new marked.Renderer();

const style = {
  colors: {
    primary: '#0074d9',
    secondary: '#ce0cb7',
  },
};
const paths = [
  '/dmca',
  '/support',
  '/magnet-to-torrent',
  '/torrent-to-ddl',
];

function analyzerPlugin(vars) {
  return vars.analyze ? [new BundleAnalyzerPlugin()] : [];
}
function compressionPlugin(vars) {
  return vars.mode == 'production' ? [new CompressionPlugin()] : [];
}
function ssrClientPlugin(vars) {
  return vars.ssrType == 'client'  ? [new VueSSRClientPlugin()] : [];
}
function ssrServerPlugin(vars) {
  return vars.ssrType == 'server'  ? [new VueSSRServerPlugin()] : [];
}
function cssExtractLoader(vars) {
  if (vars.ssrType == 'server' || vars.mode !== 'production') {
    return ['vue-style-loader'];
  } else {
    return [MiniCssExtractPlugin.loader];
  }
}
function cssLoader(vars) {
  if (vars.ssrType == 'server') {
    return ['css-loader/locals'];
  } else {
    return ['css-loader'];
  }
}

function entry(vars) {
  const entry = [vars.entry || './ui/src/client.js'];
  if (vars.mode != 'production') {
    entry.push('webpack-hot-middleware/client');
  }
  return entry;
}

module.exports = function(vars = {}) {
  const outputPattern = vars.outputPattern || '[name].[hash]';
  return {
    entry: entry(vars),
    target: vars.target || 'web',
    mode: vars.mode || 'development',
    node: {
      fs: 'empty',
    },
    resolve: {
      alias: {
        'bootstrap-vue$': 'bootstrap-vue/src/index.js'
      },
    },
    optimization: {
      moduleIds: 'hashed',
      minimizer: [new TerserJSPlugin({sourceMap: true}), new OptimizeCSSAssetsPlugin({})],
      splitChunks: {
        chunks: 'all', // optimize both static and dynamic import
        maxAsyncRequests: 5, // for each additional load no more than 5 files at a time
        maxInitialRequests: 3, // each entrypoint should not request more then 3 js files
        automaticNameDelimiter: '_', // delimeter for automatic naming
        automaticNameMaxLength: 30, // length of name
        name: true, // let webpack calculate name
        maxSize: 200000,
        minSize: 200000,
        cacheGroups: {
          async_vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'async',
            priority: 20,
            name:'async_vendor',
          },
          async_code: {
            chunks: 'async',
            priority: 10,
            name: 'async_main',
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            // enforce: true,
            name: 'vendor',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            name: 'main',
          },
        },
      },
    },
    devtool: vars.devTool || 'source-map',
    output: {
      path: path.resolve(__dirname, '../ui/dist'),
      filename: `${outputPattern}.bundle.js`,
      sourceMapFilename: `${outputPattern}.bundle.js.map`,
      publicPath: vars.publicPath || '/',
      libraryTarget: vars.libraryTarget || 'var',
    },
    externals: vars.externals || {},
    module: {
      rules: [
        {
          test: path.resolve(__dirname, '../node_modules/bootstrap-vue/src/icons/icons.js'),
          use: 'null-loader',
        },
        {
          test: /\.md$/,
          use: [
            {
                loader: 'html-loader'
            },
            {
                loader: 'markdown-loader',
                options: {
                    pedantic: true,
                    renderer,
                }
            }
          ]
        },
        {
          test: /\.txt$/,
          use: [
            'raw-loader',
          ],
        },
        {
          test: /\.svg$/,
          use: [
            'svg-url-loader',
            'svg-transform-loader',
          ],
        },
        {
          test: /\.(png|jpg|gif|eot)$/,
          loader: 'file-loader',
          options: {
            name: `${outputPattern}.[ext]`,
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            ...cssExtractLoader(vars),
            ...cssLoader(vars),
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('autoprefixer'),
                  ];
                }
              }
            },
            'svg-transform-loader/encode-query',
            {
              loader: 'sass-loader',
              options: {
                data: `$primary: ${style.colors.primary}; $secondary: ${style.colors.secondary};`,
                // sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.js$/,
          // exclude: /node_modules\/(?!bootstrap-vue\/src\/)/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/transform-runtime',
              '@babel/plugin-proposal-class-properties'
            ],
          }
        },
      ],
    },
    plugins: [
      new SitemapPlugin({ base: 'https://webtor.io', paths }),
      new webpack.HotModuleReplacementPlugin(),
      new LodashModuleReplacementPlugin(),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: `${outputPattern}.bundle.css`,
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(require('../package.json').version),
      }),
      new CopyWebpackPlugin([
        {from: 'node_modules/hls.js/dist/hls.min.js', to: 'hls.min.js'},
        {from: 'node_modules/sandblaster/dist/sandblaster.min.js', to: 'sandblaster.min.js'},
        {from: 'ui/src/assets/sintel.torrent', to: 'sintel.torrent'},
        {from: 'ui/src/assets/iframeResizer.contentWindow.min.js', to: 'iframeResizer.contentWindow.min.js'},
        {from: 'ui/src/robots.txt', to: 'robots.txt'},
        {from: 'sdk-example.html', to: 'sdk-example.html'},
      ]),
      new HTMLWebpackPlugin({
        filename: 'index.html',
        template: './ui/src/templates/ssr.ejs',
        mobile: true,
        title: 'Webtor.io',
        appMountId: 'app',
        links: [
          'https://fonts.googleapis.com/css?family=Nunito:700&display=swap',
          'https://fonts.googleapis.com/css?family=Libre+Baskerville:700&display=swap',
          {
            href: 'https://chrome.google.com/webstore/detail/ngkpdaefpmokglfnmienfiaioffjodam',
            rel: 'chrome-webstore-item',
          },
        ],
        minify: false,
        ssr: vars.ssr || false,
        inject: vars.inject || false,
      }),
      new WebappWebpackPlugin({
        logo: `svg-transform-loader!./ui/src/assets/logo.svg?fill=${style.colors.primary}`,
        prefix: 'icons/',
        inject: 'force',
      }),
      ...analyzerPlugin(vars),
      ...compressionPlugin(vars),
      ...ssrClientPlugin(vars),
      ...ssrServerPlugin(vars),
    ],
  };
};
