import {createApp} from './index';
import {createApi} from './lib/serverApi';

export default (context) => {
  return new Promise(async (resolve, reject) => {
    const {app, router, store} = await createApp({
      api: createApi(context),
      locales: context.locales,
      routerMode: 'history',
      debug: false,
      user: context.user,
      event: null,
      sdk: null,
      message: null,
      config: context.config,
      ssr: true,
    });
    const meta = app.$meta();
    context.meta = meta;
    context.state = store.state;
    router.push(context.url);
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        return reject({code: 404});
      }
      resolve(app);
    }, reject);
  });
};
