<template>
  <div :class="appClass" id="app" data-iframe-height data-iframe-width>
    <progress-bar v-if="!isEmbedded" />
    <alerts />
    <div class="content" ref="content">
      <keep-alive>
        <router-view class="router-view" v-if="ready" />
      </keep-alive>
    </div>
    <div class="footer text-muted" ref="footer" v-if="!isEmbedded">
      <b-container>
        <b-row class="justify-content-md-center text-center">
          <b-col lg="10">
            <p v-html="$tm('common.offer')" />
            <hr />
            <div class="link-block">
              <ul class="list-inline d-inline footer-links">
                <li class="list-inline-item"><b-link to="torrent-to-ddl">{{ $t('nav.torrent to ddl') }}</b-link></li>
                <li class="list-inline-item"><b-link to="magnet-to-torrent">{{ $t('nav.magnet to torrent') }}</b-link></li>
              </ul>
            </div>
            <div class="link-block">
              <span class="copyright">Copyright © {{ new Date().getFullYear() }} Webtor.io</span>
              <ul class="list-inline d-inline footer-links">
                <li class="list-inline-item"><b-link target="_blank" :href="blogUrl">{{ $t('nav.blog') }}</b-link></li>
                <li class="list-inline-item"><b-link target="_blank" href="https://github.com/webtor-io/player-sdk-js">SDK</b-link></li>
                <li class="list-inline-item"><b-link target="_blank" href="https://rapidapi.com/paveltatarsky-Dx4aX7s_XBt/api/webtor/">API</b-link></li>
                <li class="list-inline-item"><b-link target="_blank" href="https://github.com/webtor-io/">GitHub</b-link></li>
                <li class="list-inline-item"><b-link target="_blank" href="https://www.reddit.com/r/webtor/">Reddit</b-link></li>
                <li class="list-inline-item" v-if="!selfHosted"><b-link to="dmca">{{ $t('nav.dmca') }}</b-link></li>
                <li class="list-inline-item" v-if="!selfHosted"><b-link to="support">{{ $t('nav.support') }}</b-link></li>
              </ul>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>


<style scoped lang="scss">
@import "~mediaelement/build/mediaelementplayer.css";
@import "~mediaelement-plugins/dist/chromecast/chromecast.css";
@import "../css/mediaelement-plugins/settings.css";
.copyright {
  margin-right: 2rem;
  margin-bottom: 0.5rem;
  display: inline-block !important;
}
.footer-links {
  text-transform: capitalize;
  li {
    margin-bottom: 0.7rem;
  }
  a:before {
    content: '| ';
  }
  display: inline-block !important;
}
.container {
  padding: 0px;
}
.header {
  position: relative;
}
.alerts-padding {
  height: 10px;
}
.footer {
  height: auto;
  padding: 1rem;
  font-size: 0.8rem;
  position: absolute;
  bottom: 0;
  width: 100%;
}
.light .footer {
  background-color: #eee;
  border-top: 3px solid #dee2e6;
}
@media (max-width: 576px) {
  .footer {
    padding: 0.5rem;
  }
}
.app-lang-ru.app-view-mode-default {
  .content {
    padding-bottom: 14rem;
  }
}
.content {
  display: block;
  padding-bottom: 11.5rem;
  height: 100%;
}
@media (max-width: 576px) {
  .app {
    padding-left: 0px;
    padding-right: 0px;
    overflow-x: hidden;
  }
  .alerts-padding {
    height: 40px;
  }
}
.app {
  min-width: 320px;
  position: relative;
}
.nav {
  min-width: 320px;
}
</style>

<style lang="scss">
.router-view {
  .container {
    padding-left: 0;
    padding-right: 0;
  }
}
.col-lg-12 {
  padding-right: 0px;
}
.col-lg-12 .col-lg-10 {
  padding-left: 0;
}
@media (min-width: 1200px) {
  .app-view-mode-embed .container {
    max-width: unset;
  }
}
@media (min-width: 992px) {
  .app-view-mode-embed .container {
    max-width: unset;
  }
}
@media (min-width: 768px) {
  .app-view-mode-embed .container {
    max-width: unset;
  }
}
@media (min-width: 576px) {
  .app-view-mode-embed .container {
    max-width: unset;
  }
}
.app.app-view-mode-with-height {
  height: 100%;
}
.app-view-mode-download .card.download {
  padding-bottom: 0px !important;
  padding-right: 0px !important;
}
.app-view-mode-download .show {
  padding-left: 15px !important;
  padding-right: 15px !important;
  padding-top: 15px !important;
  padding-bottom: 0px !important;
}
.app-view-mode-embed {
  .player {
    .container {
      padding-right: 15px !important;
      padding-left: 15px !important;
    }
  }
  .row, .col, .container, .content, .card, .router-view, .list-group, .item-container, .me-player, .player {
    height: 100%;
  }
  overflow: hidden;
  > .content {
    padding-bottom: 0px;
  }
  .container {
    width: 100%;
    .row {
      width: 100%;
      margin-left: 0px;
      margin-right: 0px;
      .col-lg-12, .col-lg-10 {
        max-width: 100%;
        flex: 0 0 100%;
        padding-right: 0px;
        padding-left: 0px;
      }
      .col-lg-12 .container {
        padding-left: 0;
        padding-right: 0;
      }
    }
  }
  video {
    width: 100%;
    height: 100%;

  }
}
</style>

<style lang="scss">
#app.app-view-mode-default {
  background-image: url('../assets/astronomy.jpg');
  background-repeat: no-repeat;
  background-size: 100%;
  min-height: 100vh;
}
</style>

<script>
import Alerts from './App/Alerts.vue';
import {mapState, mapGetters} from 'vuex';
import {getLangLinks} from '../lib/langLinks';
import {checkAdBlock} from '../lib/adblock';
import debounce from 'lodash/debounce';
import bind from 'lodash/bind';
import ProgressBar from './App/ProgressBar.vue';

let currentFooterHeight = null;

export default {
  components: {Alerts, ProgressBar},
  data() {
    return {
      clientReady: false,
    };
  },
  computed: {
    ...mapState({
      baseURL: (state) => state.baseURL,
      ssr: (state) => state.ssr,
      torrent: (state) => state.torrent,
      loadState: (state) => state.loadState,
      baseURL: (state) => state.baseURL,
      lang: (state) => state.lang,
      viewMode: (state) => state.viewMode,
      height: (state) => state.height,
    }),
    ...mapGetters([
      'langLinks',
      'translations',
      'blogUrl',
      'backersUrl',
      'technologyUrl',
      'title',
      'isEmbedded',
      'showLogo',
      'selfHosted',
    ]),

    appClass() {
      let cl = `app app-lang-${this.lang} app-view-mode-${this.viewMode}`;
      if (this.height) {
        cl += ' app-view-mode-with-height';
      }
      if (this.isEmbedded) {
        cl += ' app-view-mode-embed';
      }
      return cl;
    },
    description() {
      const parts = [
        this.$t('intro.header'),
        this.$t('intro.header2') + '.',
        this.$t('intro.lead')
      ];
      const d = parts.join(' ', parts).replace(/\([^\)]+\)/g, '').replace(/[\[\]]/g, '').replace("\n", ' ');
      return  d;
    },
    ready() {
      let ready = true;
      if (!this.ssr) {
        ready = this.clientReady;
      }
      return ready;
    }
  },
  async beforeMount() {
    const debouncedResize = debounce(bind(this.handleResize, this), 100);
    debouncedResize();
    setInterval(debouncedResize, 250);
    const {dispatch, state} = this.$store;
    await dispatch('getUserSettings');
    if (await checkAdBlock()) {
      dispatch('adblockEnabled');
    }
    this.clientReady = true;
  },
  mounted() {
    if (window.loaded) {
      window.loaded();
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  metaInfo() {
    return {
      title: this.$t('intro.header'),
      link: getLangLinks(this.translations, this.$route, this.$router, this.baseURL, this.lang),
      meta: [
        {name: 'description', content: this.description },
      ],
      titleTemplate: '%s | ' + this.title,
      htmlAttrs: {
        lang: this.lang,
      },
    };
  },
  methods: {
    handleResize() {
      if (!this.$refs.footer) return;
      const h = this.$refs.footer.clientHeight;
      if (currentFooterHeight == h) return;
      currentFooterHeight = h;
      this.$refs.content.style.paddingBottom = `${h}px`;
    },
  },
};
</script>
