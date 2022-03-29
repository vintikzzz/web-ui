import './scss/custom.scss';
import Vue from 'vue';
import Vuex from 'vuex';
import Meta from 'vue-meta';
import Icon from 'vue-awesome/components/Icon.vue';
Vue.component('icon', Icon)
import {LayoutPlugin, ButtonPlugin, NavbarPlugin, AlertPlugin, JumbotronPlugin,
  ButtonGroupPlugin, ButtonToolbarPlugin, FormInputPlugin, LinkPlugin, FormTextareaPlugin,
  FormSelectPlugin, FormPlugin, InputGroupPlugin} from 'bootstrap-vue';
import {CardPlugin, ListGroupPlugin, ProgressPlugin} from 'bootstrap-vue';
import {FormGroupPlugin, FormRadioPlugin} from 'bootstrap-vue';
import {ModalPlugin} from 'bootstrap-vue';
Vue.use(Vuex);
Vue.use(Meta);
Vue.use(LinkPlugin);
Vue.use(LayoutPlugin);
Vue.use(ButtonPlugin);
Vue.use(NavbarPlugin);
Vue.use(AlertPlugin);
Vue.use(JumbotronPlugin);
Vue.use(ButtonGroupPlugin);
Vue.use(ButtonToolbarPlugin)
Vue.use(FormInputPlugin);
Vue.use(FormTextareaPlugin);
Vue.use(FormSelectPlugin);
Vue.use(FormPlugin);
Vue.use(CardPlugin);
Vue.use(ListGroupPlugin);
Vue.use(ProgressPlugin);
Vue.use(FormGroupPlugin)
Vue.use(FormRadioPlugin)
Vue.use(InputGroupPlugin)
Vue.use(ModalPlugin)
import vClickOutside from 'v-click-outside';
Vue.use(vClickOutside);

import {createRouter} from './lib/router';
import {createStore} from './lib/store';
import {createI18n} from './lib/i18n';
import markdown from './lib/markdown';
import App from './components/App.vue';
import registry from './lib/registry';

export async function createApp({api, db, locales, routerMode, ext, debug, user, sdk, message, config, ssr, injectHash, injectCode}) {
  const router = createRouter({mode: routerMode});
  const i18n = createI18n(locales);
  const store = createStore({router, db, api, i18n, locales, ext, debug, user, sdk, message, config, ssr, injectHash, injectCode});
  store.dispatch('init');
  registry.buildVue = (opts) => {
    return new Vue({
      i18n,
      store,
      router,
      ...opts,
    });
  };
  const app = registry.buildVue({
    render: (h) => h(App),
  })
  markdown();
  return {app, router, store};
}
