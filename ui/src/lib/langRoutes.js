const nameSuffix = '_with_lang';
export function getLangRoute(current, lang = null) {
  const params = Object.assign({}, current.params);
  let name = current.name;
  if (lang) {
    params.lang = lang;
    name = current.meta.lang ? current.name : current.name + nameSuffix;

  } else {
    delete params['lang'];
    name = current.meta.lang ? current.name.replace(nameSuffix, '') : current.name;
  }
  return {
    name,
    params,
    query: current.query,
    hash: current.hash,
  };
}
export function addLangRoutes(routes) {
  const routesWithLang = routes.map((r) => {
    return {
      ...r,
      path: `/:lang${r.path}`,
      name: r.name + nameSuffix,
      meta: {
        lang: true,
      },
      pathToRegexpOptions: {strict: true},
    };
  });
  return routes.concat(routesWithLang);
}
