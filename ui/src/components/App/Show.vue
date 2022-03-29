<template>
  <div v-if="torrent" class="show">
    <nav-bar class="nav" v-if="!isEmbedded">
      <template #post>
        <b-nav-item-dropdown class="hamburger" right text="☰">
          <template slot="button-content">
            <icon name="bars" scale="1.6"></icon>
          </template>
          <b-dropdown-item @click.prevent.stop="" v-b-modal.share-link-modal>{{ $tm('common.share link') }}</b-dropdown-item>
          <b-dropdown-item @click.prevent.stop="" v-b-modal.magnet-uri-modal>{{ $tm('common.magnet uri') }}</b-dropdown-item>
          <b-dropdown-item @click.stop.prevent="$store.dispatch('zip')">{{ $tm('common.download') }}</b-dropdown-item>
        </b-nav-item-dropdown>
      </template>
    </nav-bar>
    <div class="content">
      <b-container v-if="!isDownloadMode">
        <b-row class="justify-content-md-center">
          <b-col lg="10">
            <b-card no-body>
              <b-card-body v-if="showHeader" class="header" :title="title" :sub-title="pwd">
                <b-button-group class="header-buttons">
                  <share-link class="share-link" />
                  <magnet-uri class="magnet-uri" />
                  <download-zip v-if="showDownload" class="zip" />
                </b-button-group>
              </b-card-body>
              <list
                :items="items"
              ></list>
            </b-card>
            <div v-if="!isEmbedded">
              <b-button-toolbar class="send dropup justify-content-between">
                <send></send>
                <b-button-group>
                  <sponsor />
                </b-button-group>
              </b-button-toolbar>
              <login v-if="hasLogin" class="login" />
            </div>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center adsense" v-if="displayAdsense">
          <b-col lg="10">
            <adsense-ad ad-name="showBottom" ad-format="auto" />
          </b-col>
        </b-row>
      </b-container>
    </div>
    <b-modal v-if="!isDownloadMode" :visible="showDownloadModal" id="download-modal" ref="download-modal" @hide="onDownloadHide" hide-footer centered no-fade>
      <download />
    </b-modal>
    <download v-if="isDownloadMode && showDownloadModal" />
    <adsense-ad class="sticky-ad" ad-name="showLeftSticky" ad-format="auto" v-if="displayAdsense && windowWidth > 1425" />
  </div>
</template>

<style lang="scss">
.app-view-mode-embed {
  .show {
    .content {
      padding-top: 0;
    }
  }
}
.hamburger {
  display: none;
  margin-left: 0.6rem;
  .dropdown-toggle::after {
    content: none;
  }
  a.dropdown-toggle {
    font-size: 1.85rem;
    background: none !important;
    padding-left: 0rem !important;
    padding-right: 0rem !important;
    padding-bottom: 0rem;
    padding-top: 0rem;
    margin-top: -0.75rem;
    margin-right: -0.6rem;
    &:hover {
      text-decoration: none !important;

    }
  }
}
#download-modal {
  .modal-body {
    margin-top: -2rem;
  }
  .close {
    z-index: 1000;
  }
}
@media (max-width: 576px) {
  .hamburger {
    display: block;
  }
  #download-modal {
    .modal-dialog {
        width: 100vw;
        margin: 0;
        .modal-content {
            border-radius: 0;
        }
    }
  }
}
</style>
<style scoped lang="scss">
.content {
  padding-top: 3rem;
}
.sticky-ad {
  width: 240px;
  position: fixed;
  left: 0rem;
  bottom: 5rem;
}
.adsense {
  padding-top: 0.5rem;
}
.header-buttons {
  .btn {
    border-radius: 0;
  }
  .btn:first-child {
    border-radius: 0;
    border-top-left-radius: 0.3rem;
    width: 100%;
  }
}
.card-subtitle {
  width: calc(100% - 13rem);
}
.card {
  border-bottom: none !important;
}
@media (max-width: 992px) {
  .header {
    padding-bottom: 2.2rem;
  }
  .card-subtitle {
    width: 100%;
  }
}


@media (max-width: 576px) {
  .content {
    padding-top: 0.5rem;
  }
  .send {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .header-buttons {
    display: none;
  }
  .header {
    padding-top: 2.8rem;
    padding-bottom: 0.5rem !important;
  }
  .card {
    border: none !important;
  }
  .zip {
    border-radius: 0;
  }
}
.login {
  position: relative;
  top: -0.7rem;
}
@media (max-width: 576px) {
  .login {
    padding-left: 0.5rem;
  }
}
.list-group {
  border-top: none !important;
}
.header {
  position: relative;
  padding-bottom: 2.8rem;
  border-bottom: none !important;
}
.header-buttons {
  position: absolute;
  bottom: -1px;
  right: -1px;
}
.send {
  margin-top: 1rem;
  margin-bottom: 0.9rem;
}
.player {
  margin-left: -1px;
  width: calc(100% + 2px);
  z-index: 1000;
}
h4, h6 {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
h4 {
  font-size: 2rem;
}

</style>

<script>
import AdsenseAd from './AdsenseAd.vue';
import Send from './Send.vue';
import List from './Show/List.vue';
import Player from './Show/Player.vue';
import DownloadZip from './Show/DownloadZip.vue';
import Download from './Show/Download.vue';
import ShareLink from './Show/ShareLink.vue';
import MagnetUri from './Show/MagnetURI.vue';
import Alerts from './Alerts.vue';
import Sponsor from './Sponsor.vue';
import Login from './Login.vue';
import NavBar from './NavBar.vue';
import {mapState, mapGetters} from 'vuex';
import path from 'path';
import 'vue-awesome/icons/bars';
const debug = require('debug')('webtor:components:app:show');

export default {
  components: {AdsenseAd, Send, List, Player, Alerts, Sponsor, Login, DownloadZip, ShareLink, MagnetUri, Download, NavBar},
  data() {
    return {
      showDownloadModal: false,
    };
  },
  computed: {
    ...mapState({
      torrent: (state) => state.torrent,
      file: (state) => state.file,
      title: (state) => state.torrent ? state.torrent.name: null,
      pwd: (state) => state.pwd,
      adsInjected: (state) => state.adsInjected,
      downloadPath: (state) => state.downloadPath,
      windowWidth: (state) => state.windowWidth,
    }),
    ...mapGetters([
      'ls',
      'displayPopups',
      'isEmbedded',
      'isVideoMode',
      'isDownloadMode',
      'showShare',
      'showDownload',
      'displayAdsense',
      'displayAdfox',
      'hasLogin'
    ]),
    items() {
      let items = this.ls;
      if (this.isDownloadMode) {
        return [];
      }
      if (this.file && this.isVideoMode) {
        items = items.filter((i) => i.name == this.file);
      }
      return items;
    },
    showHeader() {
      return !this.isEmbedded;
    }
  },
  watch: {
    downloadPath(path, _) {
      if (path) {
        this.showDownloadModal = true;
        // this.$refs['download-modal'].show();
      } else {
        // this.$refs['download-modal'].hide();
        this.showDownloadModal = false;
      }
    },
  },
  methods: {
    onDownloadHide() {
      this.$store.dispatch('hideDownload');
      return true;
    },
  },
  async deactivated() {
    await this.$store.dispatch('cleanTorrent');
  },
  async beforeMount() {
    // this.$ga.event('Show', 'SHOW');
    await this.$store.dispatch('fetchTorrent');
    await this.$store.dispatch('initAdScripts');
    return
  },
  metaInfo() {
    return {
      title: this.file || path.basename(this.pwd) || this.$t('common.loading torrent'),
    };
  },
};
</script>
