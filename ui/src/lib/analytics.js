import Vue from 'vue';
import VueGtag from 'vue-gtag';

export function analytics({id, appId, appVersion, appName}) {
  Vue.use(VueGtag, {
    config: {
      id: id,
      appName,
      appId,
      appVersion,
      params: {
        send_page_view: false,
      },
    },
  });
};
