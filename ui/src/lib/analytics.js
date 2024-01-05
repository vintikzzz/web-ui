export function analytics({id, appId, appVersion, appName}) {
  const url = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = url;
  document.body.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', id);
};
