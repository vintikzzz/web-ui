import merge from 'deepmerge';
import dot from 'dot-object';
import arrayToText from './store/arrayToText';
import VueI18n from 'vue-i18n';
import Vue from 'vue';
import locale from 'locale';
import langs from './langs';
const debug = require('debug')('webtor:i18n');
const supported = new locale.Locales(langs);
const messages = {};
for (let l of langs) {
  messages[l] = dot.dot(arrayToText(
    merge(
      require(`../i18n/common.json`),
      require(`../i18n/${l}.json`),
    )
  ));
}
Vue.use(VueI18n);
export function createI18n(locales) {
  const bestLocale = locales.best(supported);
  const lang = bestLocale.normalized;
  return new VueI18n({
    locale: lang,
    fallbackLocale: 'en',
    messages,
    pluralizationRules: {
      'ru': function(choice, choicesLength) {
        if (choice === 0) {
          return 0;
        }
        const teen = choice > 10 && choice < 20;
        const endsWithOne = choice % 10 === 1;
        if (choicesLength < 4) {
          return (!teen && endsWithOne) ? 1 : 2;
        }
        if (!teen && endsWithOne) {
          return 1;
        }
        if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
          return 2;
        }
        return (choicesLength < 4) ? 2 : 3;
      }
    },
  });
}
