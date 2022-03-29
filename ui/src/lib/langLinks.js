import {getLangRoute} from './langRoutes';
export function getLangLinks(translations, route, router, baseURL, lang) {
    const res = [];
    for (const key in translations) {
        const r = getLangRoute(route, key);
        const href = baseURL + router.resolve(r).href.replace('#', '');
        res.push({rel: 'alternate', hreflang: key, href})
        if (key == lang) {
            res.push({rel: 'canonical', hreflang: key, href})
        }
    }
    return res;
}