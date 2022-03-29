import Vuex from 'vuex';

import state from './store/state';
import mutations from './store/mutations';
import getters from './store/getters';
import actions from './store/actions';
import hls from './store/modules/hls';
import player from './store/modules/player';

export function createStore({router, i18n, ext, debug: deb, db, user, sdk, message, config, ssr, injectHash, injectCode, locales}) {
  return new Vuex.Store({
    modules: {
      hls,
      player,
    },
    strict: true,
    state: state({user, deb, i18n, ssr, locales}),
    mutations,
    getters: getters({i18n, sdk, message, config}),
    actions: actions({router, message, db, sdk, ext, i18n, injectHash, injectCode, config}),
  });
};
