import '../src/scss/preloader.scss';
function inIframe() {
  try {
      return window.self !== window.top;
  } catch (e) {
      return true;
  }
}
const appLoadWrapper = document.getElementById('app-load-wrapper');
const preloader = document.getElementById('preloader');
if (inIframe()) {
  appLoadWrapper.classList.remove('hide');
} else {
  preloader.classList.remove('hide');
  window.loaded = () => {
    setTimeout(() => {
      preloader.classList.add('hide');
      appLoadWrapper.classList.remove('hide');
      appLoadWrapper.classList.add('fade-in');
    }, 500);
  }
}
import('./real_client');