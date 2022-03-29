import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import {addLangRoutes} from './langRoutes';
const routes = addLangRoutes([
  {path: '/', name: 'intro', component: () => import('../components/App/Intro.vue')},
  {path: '/show', name: 'show', component: () => import('../components/App/Show.vue')},
  {path: '/support', name: 'support', component: () => import('../components/App/Support.vue')},
  {path: '/dmca', name: 'dmca', component: () => import('../components/App/DMCA.vue')},
  {path: '/magnet-to-torrent', name: 'magnet2torrent', component: () => import('../components/App/Tools/Magnet2Torrent.vue')},
  {path: '/torrent-to-magnet', name: 'torrent2magnet', component: () => import('../components/App/Tools/Torrent2Magnet.vue')},
  {path: '/torrent-to-ddl', name: 'torrent2ddl', component: () => import('../components/App/Tools/Torrent2DDL.vue')},
  {path: '/empty', name: 'empty', component: () => import('../components/App/Empty.vue')},
  {path: '/:magnet(magnet\:.*)', name: 'magnet-uri', component: () => import('../components/App/Show.vue')},
  {path: '/:infohash([0-9a-fA-F]{40})', name: 'infohash', component: () => import('../components/App/Show.vue')},
]);

export function createRouter({mode}) {
  return new VueRouter({
    mode,
    routes,
  });
}
