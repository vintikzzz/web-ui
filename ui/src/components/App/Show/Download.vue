<template>
    <b-card class="download"
      :title="file"
      :sub-title="$t('common.size') + ': ' + size"
    >
      <icon class="type-icon" :name="typeIconName" scale="3"></icon>
      <b-input-group class="copy">
        <template #prepend>
          <b-dropdown :text="copyTitle" variant="primary">
            <b-dropdown-item @click="selectUrl">url</b-dropdown-item>
            <b-dropdown-item @click="selectWget">wget</b-dropdown-item>
          </b-dropdown>
        </template>
        <b-form-input :value="copyText" readonly></b-form-input>
        <b-input-group-append>
          <b-button variant="primary" class="copy-btn" @click="copy">
            <icon name="copy"></icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <b-button class="download-btn" v-if="showDownload" @click="proceedDownload" variant="primary" size="lg">{{ $t('common.direct download') }}</b-button>
      <b-button variant="primary" size="lg" class="download-btn progress-btn" v-if="showProgress">
        <stat :path="downloadPath" download="true"></stat>
      </b-button>
      <a @click.stop.prevent="onTorrentDownload" class="download-torrent-btn">{{ $t('common.torrent download') }}</a>
      <b-alert variant="warning" :show="isZip" v-html="$tm('errors.win zip')"></b-alert>
      <adsense-ad ad-name="download" ad-format="auto" />
    </b-card>
</template>

<script>
import 'vue-awesome/icons/copy';
import {mapState, mapGetters} from 'vuex';
import Stat from './List/Item/Stat.vue';
const numeral = require('numeral');
import * as clipboard from 'clipboard-polyfill';
import AdsenseAd from '../AdsenseAd.vue'
export default {
  data() {
    return {
      downloading: false,
      copyText: '',
      downloadUrl: '',
      copyTitle: 'url',
    };
  },
  components: {Stat, AdsenseAd},
  computed: {
    ...mapGetters([
      'sdk',
      'downloadSize',
      'downloadFile',
    ]),
    ...mapState({
      downloadPath: (state) => state.downloadPath,
      downloadType: (state) => state.downloadType,
      torrent: (state) => state.torrent,
      stats: (state) => state.downloadStats,
    }),
    isZip() {
      return this.downloadType == 'zip';
    },
    ext() {
      return this.isZip ? '.zip' : '';
    },
    file() {
      return this.downloadFile + this.ext;
    },
    mediaType() {
      return this.sdk.util.getMediaType(this.file);
    },
    typeIconName() {
      if (this.isZip) return 'file-archive';
      if (this.mediaType == 'subtitle') return 'file-alt';
      if (this.mediaType) return `file-${this.mediaType}`;
      return 'file';
    },
    size() {
      return numeral(this.downloadSize).format('0.0b');
    },
    stat() {
      if (this.stats[this.downloadPath]) {
        return this.stats[this.downloadPath];
      } else {
        return false;
      }
    },
    showDownload() {
      return this.stat === false && !this.downloading;
    },
    showProgress() {
      return this.stat !== false || this.downloading;
    },
  },
  methods: {
    copy() {
      clipboard.writeText(this.copyText);
      this.$store.dispatch('hideDownload');
    },
    selectUrl(e) {
      this.copyText = this.downloadUrl.toString();
      this.copyTitle = 'url';
    },
    selectWget(e) {
      this.copyText = `wget -c -O '${this.file}' -t 20 '${this.downloadUrl.toString()}'`
      this.copyTitle = 'wget';
    },
    proceedDownload() {
      this.downloading = true;
      this.$store.dispatch('proceedDownload');
    },
    onTorrentDownload() {
      this.$store.dispatch('proceedTorrentDownload');
    },
  },
  async mounted() {
    this.downloadUrl = await this.$store.dispatch('downloadUrl');
    this.selectUrl();
  },
}
</script>

<style lang="scss">
.download .input-group-prepend .btn {
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}
</style>

<style lang="scss" scoped>
#adsense-ad-download {
  margin-top: 1.5rem;
}
.alert {
  margin-bottom: 0px;
  margin-top: 1.5rem;
}
.progress-btn {
  text-align: left;
  padding-top: 0;
  height: 3rem;
}
.card {
  border: none !important;
  padding: 0;
}
.card-body {
  padding: 0;
}
.card-title, .card-subtitle {
  padding-left: 3.5rem;
  padding-right: 1rem;
}
.type-icon {
  position: absolute;
  left: 0rem;
  top: 0.3rem;
}
.download {
  padding-bottom: 0.5rem;
}
.download-btn {
  margin-top: 1rem;
  width: 100%;
  margin-bottom: 0.5rem;
}
.download-torrent-btn {
  white-space: nowrap;
  cursor: pointer;
}
.copy {
  padding-top: 1rem;
}
.copy-btn svg {
  margin-top: -3px;
}

</style>