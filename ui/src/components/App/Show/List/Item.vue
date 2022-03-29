<template>
  <div :class="className" v-if="canShow">
    <b-list-group-item :class="itemClass" :href="href"
      @click="onClick" :active="isActive" 
      :title="title" @mouseover="onMouseOver" @mouseleave="onMouseLeave">
      <span class="title" v-if="showTitle">
        <icon class="state" v-if="watched" name="check" scale="0.7"></icon>
        <icon class="type-icon" v-if="typeIconName" :name="typeIconName" scale="1.5"></icon>
        <div v-if="showSize">
          <span class="file-name">{{ title }}</span>
          <span class="size">{{size}}</span>
        </div>
        <div v-if="!showSize">
          <span class="file-name file-name-without-size">{{ title }}</span>
        </div>
      </span>
      <stat v-if="showStat" :path="item.path"></stat>
      <span class="download" v-if="showDownload && (!isVideo || !isActive)" @click.prevent.stop="onDownload">
        <icon class="status-icon" v-if="hovered && !isSupported && !isDir" name="download"
          scale="1.5"></icon>
        <icon class="download-icon" v-if="hovered && isSupported && !isDir" name="download"
          scale="1.5"></icon>
      </span>
      <span class="status" v-if="showStatus">
        <icon class="status-icon" v-if="hovered && isSupported && !isActive && !isImage && !isDir" name="play"
          scale="1.5"></icon>
        <icon class="status-icon" v-if="hovered && isImage && !isActive" name="eye"
          scale="1.5"></icon>
        <icon class="status-icon" v-if="isImage && isActive && !inProgress" name="eye"
          scale="1.5"></icon>
        <icon class="status-icon blink" v-if="isPlaying && (!isVideo || !isActive)" name="play"
          scale="1.5"></icon>
        <icon class="status-icon" v-if="isPaused && !isImage && (!isVideo || !isActive)" name="pause"
          scale="1.5"></icon>
        <icon class="status-icon" v-if="inProgress && (!isVideo || !isActive)" name="circle-notch"
          scale="1.5" spin></icon>
        <icon class="status-icon" v-if="hasError" name="ban"
          scale="1.5"></icon>
      </span>

    </b-list-group-item>
    <player v-if="isActive" class="player"></player>
  </div>
</template>

<style scoped lang="scss">
.stats {
  padding-right: 1.5rem;
  margin-top: -2px;
}
a:hover {
  text-decoration: none !important;
}
.item-container {
  position: relative;
  min-height: 3rem;
}
.item-active.item-video, .item-active.item-image{
  background-color: transparent !important;
  color: white !important;
  border-bottom: none !important;
  // background: black !important;
  visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  background-image: linear-gradient(to top, rgba(0,0,0,0), rgba(0,0,0,0.3)) !important;
}
.player {
  margin-top: 1px;
}
.item-active.item-video.player-with-controls, .item-active.item-image.player-with-controls  {
  visibility: visible;
}
.item {
  position: relative;
}
.state {
  position: absolute;
  left: 4px;
  top: 4px;
}
.file-name {
  width: calc(100% - 60px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  position: relative;
}
.file .file-name {
  top: -7px;
}
.file-name-without-size {
  font-size: 1.3rem;
  top: -3px !important;
}
.type-icon {
  float: left;
  margin-right: 0.75rem;
}

.status-icon {
  position: absolute;
  right: 10px;
  top: 12px;
}
.download-icon {
  position: absolute;
  right: 40px;
  top: 12px;
}
.download-msg {
  position: absolute;
  right: 40px;
  top: 12px;
}
.size {
  position: absolute;
  left: 50px;
  top: 26px;
  font-size: 0.6rem;
}
.blink {
  animation: blinker 1s linear infinite;
}

@keyframes blinker {
  50% { opacity: 0.5; }
}
.active.item-audio {
  border-bottom: none !important;
  padding-bottom: 0 !important;
  .stats {
    padding-bottom: 0.75rem;
  }
}
.stats-completed {
  display: none;
}
</style>

<script>
import path from 'path';
import {mapState, mapGetters} from 'vuex';
import Stat from './Item/Stat.vue';
import {PLAYING, PAUSE, ENDED, IDLE} from './../../../../lib/store/playerStatusTypes';
import parseTorrent from 'parse-torrent';
import Player from '../Player.vue';
import 'vue-awesome/icons/file-image';
import 'vue-awesome/icons/circle-notch';
import 'vue-awesome/icons/file-alt';
import 'vue-awesome/icons/file-archive';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/pause';
import 'vue-awesome/icons/ban';
import 'vue-awesome/icons/check';
import 'vue-awesome/icons/file-video';
import 'vue-awesome/icons/file-audio';
import 'vue-awesome/icons/file';
import 'vue-awesome/icons/download';
import 'vue-awesome/icons/eye';
import 'vue-awesome/icons/level-up-alt';
import 'vue-awesome/icons/folder';
const numeral = require('numeral');
export default {
  components: {
    Stat,
    Player,
  },
  data() {
    return {
      hovered: false,
    };
  },
  props: ['item'],
  computed: {
    ...mapGetters([
      'filePath',
      'deepLevel',
      'showDownload',
      'showStatus',
      'sdk',
    ]),
    ...mapState([
      'header',
      'pwd',
      'externalTitle',
      'stats',
      'isCached',
      'errors',
      'playerStatus',
      'playerFilePath',
      'deliveryFailure',
      'torrent',
      'currentDirFileState',
      'features',
    ]),
    className() {
      let cl = 'item-container';
      if (this.isDir) {
        cl += ' dir';
      } else {
        cl += ' file';
      }
      return cl;
    },
    showSize() {
      return !this.isActive;
    },
    showTitle() {
      return this.features.title;
    },
    title() {
      return this.externalTitle || this.item.name;
    },
    magnet() {
      return parseTorrent.toMagnetURI(this.torrent);
    },
    showStat() {
      // return this.features.p2pProgress && isActive && !this.hasError;
      // return this.features.p2pProgress && ((this.isActive && (!this.isIdle || this.isImage)) && !this.hasError);
      return this.features.p2pProgress && this.isActive && (!this.isIdle || this.isImage) && !this.hasError && !this.isCached;
        // && ((this.currentStat && this.currentStat.completed < this.currentStat.total) || !this.currentStat || this.currentStat.status == 0);
    },
    size() {
      for (const f of this.torrent.files) {
        if (('/' + f.path) == this.item.path) {
          return numeral(f.length).format('0.0b');
        }
      }
    },
    currentStat() {
      return this.stats[this.item.path];
    },
    currentError() {
      return this.errors[this.item.path];
    },
    hasError() {
      return this.currentError !== undefined;
    },
    mediaType() {
      return this.sdk.util.getMediaType(this.item.path);
    },
    watched() {
      return this.currentDirFileState[this.item.name] !== undefined;
    },
    itemClass() {
      let res = 'item';
      if (this.watched) {
        res += ' item-watched';
      }
      if (this.isActive) {
        res += ' item-active';
        if (this.$store.state.playerControlsShown || this.mediaType != 'video') {
            res += ' player-with-controls';
        }
      }
      res += ' item-' + this.mediaType;
      return res;
    },
    isDir() {
      return this.item.type == 'dir';
    },
    isSupported() {
      if (this.hasError) return false;
      if (this.isDir) return true;
      if (this.mediaType == 'subtitle') return false;
      if (this.mediaType) return true;
    },
    canShow() {
      if (!this.header) return false;
      if (this.item.name == '.') return false;
      if (this.item.name == '.') return false;
      if (this.deepLevel < 2 && this.item.name == '..') return false;
      if (this.item.name == '..' && this.pwd == '/') return false;
      return true;
    },
    typeIconName() {
      if (this.item.name == '.') return 'home';
      if (this.item.name == '..') return 'level-up-alt';
      if (this.item.type == 'dir') return 'folder';
      if (this.mediaType == 'subtitle') return 'file-alt';
      if (this.mediaType) return `file-${this.mediaType}`;
      return 'file';
    },
    isImage() {
      return this.mediaType == 'image';
    },
    isVideo() {
      return this.mediaType == 'video';
    },
    isPlaying() {
      return this.isLoaded && this.playerStatus == PLAYING;
    },
    isPaused() {
      return this.isLoaded && this.playerStatus == PAUSE;
    },
    isIdle() {
      return this.isLoaded && this.playerStatus == IDLE;
    },
    isEnded() {
      return this.isLoaded && this.playerStatus == ENDED;
    },
    inProgress() {
      if (this.deliveryFailure) return false;
      if (!this.isActive) return false;
      if (!this.isLoaded) return true;
      if (this.isEnded || this.isPaused || this.isPlaying) return false;
      return true;
    },
    isActive() {
      return `/${this.filePath}` == this.item.path;
    },
    isLoaded() {
      return `/${this.playerFilePath}` == this.item.path;
    },
    href() {
      let route = {};
      if (this.item.type == 'dir') {
        route = {
          query: {pwd: this.item.path, magnet: this.magnet},
        };
      } else {
        route = {
          query: {file: this.item.name, pwd: this.pwd, magnet: this.magnet},
        };
      }
      route.name = this.$route.name;
      route.meta = this.$route.meta;
      route.params = this.$route.params;
      return this.$router.resolve(route).href;
    },
  },
  methods: {
    onMouseOver(){
      this.hovered = true;
    },
    onMouseLeave(){
      this.hovered = false;
    },
    async onClick(e) {
      e.preventDefault()
      if (this.item.type == 'dir') {
        this.$store.dispatch('cd', this.item.path);
      } else if (this.isActive && this.isPlaying) {
        this.$store.dispatch('pause');
      } else if (this.isActive && this.isPaused) {
        this.$store.dispatch('play');
      } else if (this.isSupported) {
        this.$store.dispatch('open', path.basename(this.item.path));
      }
      return false;
    },
    async onDownload(e) {
      await this.$store.dispatch('download', this.item.path);
    }
  },
};
</script>
