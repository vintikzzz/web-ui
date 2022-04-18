import {createApp} from './index';
import {createDb} from './lib/clientDb';
import {analytics} from './lib/analytics';
import {createExt} from './lib/ext';
import locale from 'locale';
import message from './lib/message';
import webtor from '@webtor/platform-sdk-js';
let url = (window.location != window.parent.location)
      ? document.referrer
      : document.location.href;
if (url) url = new URL(url);
let token = window.__TOKEN__;
let user = window.__USER__;
let config = JSON.parse(Buffer.from(window.__CONFIG__, 'base64').toString('utf-8'));
let injectCode = window.__INJECT_CODE__;
let injectHash = window.__INJECT_HASH__;
if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.user) {
  user = window.__INITIAL_STATE__.user;
}

const sdk = webtor(Object.assign({
  async getToken() {
    if (!token) return null;
    const res = await fetch('/token/', {
      headers: {
        token,
      },
    });
    token = await res.text();
    return token;
  },
}, config.sdk));
if (config.ga) {
  analytics(Object.assign({
    appVersion: require('../../package.json').version,
  }, config.ga));
}
const ext = createExt();
const routerMode = null;
const lang = window.navigator.userLanguage || window.navigator.language;
const locales = new locale.Locales(lang);
let debug = false;
try {
  debug = localStorage && !!localStorage.debug;
} catch (e) {
  console.log(e);
}
(async () => {
  const db = await createDb();
  const {app, router, store} = await createApp({locales,
    routerMode, ext, debug, db, user, sdk, message, url, config, ssr: false, injectCode, injectHash});
  if (window.__INITIAL_STATE__) {
    window.__INITIAL_STATE__.ssr = false;
    store.replaceState(window.__INITIAL_STATE__);
  }
  router.onReady(async() => {
    app.$mount('#app');
    store.dispatch('updateWindowWidth');
  });
})()
