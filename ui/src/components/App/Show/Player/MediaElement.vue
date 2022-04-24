<template>
  <div>
    <div :class="className" ref="container" />
    <transition name="slide-fade">
      <div v-show="showAdWithDelay && !adClosed" class="ad">
        <span href="#" class="close" @click.prevent.stop="closeAd" />
        <span class="ad-label">[ad]</span>
        <adsense-ad ref="adsense" ad-name="player" ad-style="display:inline-block;width:300px;height:250px" />
      </div>
    </transition>
  </div>
</template>
<script>
import AdsenseAd from '../../AdsenseAd.vue';
const debug = require('debug')('webtor:player');
import 'mediaelement';
import '../../../../lib/mediaelement-plugins/settings';
import '../../../../lib/mediaelement-plugins/chromecast';
import '../../../../lib/mediaelement-plugins/continue';
import '../../../../lib/mediaelement-plugins/advancedtracks';
import '../../../../lib/mediaelement-plugins/browse';
import '../../../../lib/mediaelement-plugins/download';
import '../../../../lib/mediaelement-plugins/captions';
import '../../../../lib/mediaelement-plugins/error';
import '../../../../lib/mediaelement-plugins/embed';
import '../../../../lib/mediaelement-plugins/availableprogress';
import '../../../../lib/mediaelement-plugins/logo';
import 'mediaelement/build/lang/ru';
const {MediaElementPlayer} = global;
import {mapState, mapGetters} from 'vuex';
import {SET_PLAYER_STATUS_SUCCESS, SET_PLAYER_SOURCE_URL_SUCCESS, SET_PLAYER_NATIVE_FULLSCREEN,
        SET_PLAYER_FILE_PATH_SUCCESS, SET_LOAD_STATE, SET_PLAYER_CONTROLS_SHOWN, SET_PLAYER_FULLSCREEN} from '../../../../lib/store/mutationTypes';
import {PLAYING, PAUSE, SEEKING, SEEKED,
        ENDED, PLAY, IDLE} from '../../../../lib/store/playerStatusTypes';
const loadScript = require('load-script2');
const Url = require('url-parse');

mejs.i18n.ru['mejs.download-video'] = 'Скачать видео';

let cursorHidden = false;
let cursorTimeout = null;
let timerId = false;

export default {
  components: {AdsenseAd},
  data() {
    return {
      currentState: null,
      adClosed: false,
      adDelayLock: false,
      adCloseLock: false,
      firstPlay: true,
      loaded: false,
    };
  },
  computed: {
    ...mapState({
      globalFirstPlay: (state) => state.firstPlay,
      source: (state) => state.source,
      torrent: (state) => state.torrent,
      lang: (state) => state.lang,
      status: (state) => state.playerStatus,
      format: (state) => state.source ? state.source.format : null,
      multibitrate: (state) => {
        if (!state.source) return false;
        if (!state.source.sources) return false;
        if (!state.source.sources[0]) return false;
        if (state.source.sources[0].src.multibitrate) return true;
        return false;
      },
      cached: (state) => {
        if (!state.source) return false;
        if (!state.source.sources) return false;
        if (!state.source.sources[0]) return false;
        if (state.source.sources[0].src.cached) return true;
        return false;
      },
      vastURL: (state) => state.vastURL,
      time: (state) => state.time,
      file: (state) => state.file,
      width: (state) => state.width,
      height: (state) => state.height,
      playerFilePath: (state) => state.playerFilePath,
      playerSourceUrl: (state) => state.playerSourceUrl,
      completedPieces: (state) => state.completedPieces,
      features: (state) => state.features,
      newPosition: (state) => state.newPosition,
      seeder: (state) => state.seeder,
      subtitle: (state) => state.player.subtitle,
      audio: (state) => state.player.audio,
      nativeSubtitles: (state) => window.me.Features.isAndroid || me.Features.isiOS,
    }),
    ...mapGetters([
      'filePath',
      'displayAds',
      'subtitles',
      'displayPrerolls',
      'isSponsor',
      'underPlayerBanner',
      'isEmbedded',
      'displayAdsense',
    ]),
    showAd() {
      // return false;
      return this.format != 'audio' && this.displayAdsense && this.$store.state.playerStatus != PLAYING && this.firstPlay === false && this.adClosed !== true;
    },
    showAdWithDelay() {
      return (this.showAd || this.adDelayLock) && !this.adCloseLock; 
    },
    className() {
      let c = 'me-player';
      if (this.$store.state.playerControlsShown) {
        c += ' me-player-with-controls';
      } else {
        c += ' me-player-without-controls';
      }
      if (this.$store.state.playerNativeFullScreen) {
        c += ' me-player-native-fullscreen';
      } else {
        c += ' me-player-non-native-fullscreen';
      }
      if (this.$store.state.playerFullScreen) {
        c += ' me-player-fullscreen';
      } else {
        c += ' me-player-normalscreen';
      }
      if (this.firstPlay) {
        c += ' me-player-first-play';
      } else {
        c += ' me-player-not-first-play';
      }
      if (this.loaded) {
        c += ' me-player-loaded';
      } else {
        c += ' me-player-not-loaded';
      }
      c += ' me-player-' + this.format;
      return c;
    },
    stretching() {
      if (this.width && this.height) return 'auto';
      return 'responsive';
    }
  },
  created: function() {
    window.addEventListener('mousemove', this.mouseMove);
  },
  watch: {
    showAdWithDelay(a, b) {
      if (a) {
        this.$refs.adsense.refresh();
      }
    },
    newPosition(a, b) {
      if (a != null && this.firstPlay === false) {
        this.$player.currentTime = a;
      }
    },
    subtitle(a) {
      this.setSubtitle(a);
    },
    audio(a) {
      this.setAudio(a);
    },
    status(a, b) {
      if (this.currentStatus == null || this.currentStatus == this.status) return;
      if (this.status == PAUSE) this.$player.pause();
      if (this.status == PLAYING) this.$player.play();
    },
    showAd(a, b) {
      const self = this;
      if (a == true && b == false && !self.adDelayLock) {
        self.adDelayLock = true;
      }
    },
  },
  methods: {
    dropTracks(el) {
      for (const e of el.querySelectorAll('track')) {
        e.remove();
      };
    },
    setSubtitle(a) {
      if (!a) return;
      if (!this.hlsPlayer || a.type != 'hls') {
        a.default = true;
        for (const v of this.$el.querySelectorAll('video')) {
          this.dropTracks(v);
          this.appendTrack(v, a);
        }
      } else {
        this.hlsPlayer.subtitleTrack = a.id;
      }
    },
    setAudio(a) {
      if (!this.hlsPlayer || !a) return;
      this.hlsPlayer.audioTrack = a.id;
    },
    openAd() {
      window.open(this.underPlayerBanner.targetURL);
    },
    mouseMove(e) {
      if (cursorHidden) return;
      cursorHidden = false;
      clearTimeout(cursorTimeout);
      this.$el.style.cursor = 'default';
      if (this.format == 'video') {
        cursorTimeout = setTimeout(this.hideCursor, 1000);
      }
    },
    hideCursor() {
      this.$el.style.cursor = 'none';
      cursorHidden = true;
      setTimeout(function() {
        cursorHidden = false;
      }, 500);
    },
    updateStatus(status) {
      const {dispatch} = this.$store;
      this.currentStatus = status;
      if (status === PAUSE) {
        this.adClosed = false;
      }
      dispatch('updatePlayerStatus', status);
    },
    updateTime(file, time) {
      const {dispatch} = this.$store;
      dispatch('updateTime', {file, time});
    },
    updateAvailableDuration(duration) {
      const {dispatch} = this.$store;
      dispatch('player/updateAvailableDuration', duration);
    },
    updateDuration(duration) {
      const {dispatch} = this.$store;
      dispatch('player/updateDuration', duration);
    },
    dropClient() {
      if (this.client) {
        this.client.destroy();
      }
    },
    dropPlayer() {
      let d = this.$player;
      if (this.$player) {
        this.$player = null;
        if (!d.paused) {
          d.pause();
        }
        d.remove();
        this.$el.innerHTML = '';
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    },
    appendTrack(el, t) {
      const tel = document.createElement('track');
      tel.setAttribute('src', t.src.href);
      tel.setAttribute('kind', t.kind);
      tel.setAttribute('label', t.label);
      tel.setAttribute('srclang', t.srclang);
      if (t.default) tel.setAttribute('default', 'default');
      el.appendChild(tel);
    },
    initEl() {
      const {format, sources, tracks, autoplay, poster} = this.source;
      const el = document.createElement(format);
      el.setAttribute('crossorigin', 'anonymous');
      if (autoplay) el.setAttribute('autoplay', 'autoplay');
      const preload = (autoplay || this.completedPieces.length > 0 || this.cached) && !this.globalFirstPlay ? 'auto' : 'none';
      // const preload = 'none';
      el.setAttribute('preload', preload);
      if (poster) el.setAttribute('poster', poster);
      if (this.width && this.stretching == 'auto') el.setAttribute('width', this.width);
      if (this.height && this.stretching == 'auto') el.setAttribute('height', '100%');
      for (const s of sources) {
        const sel = document.createElement('source');
        sel.setAttribute('src', s.src.href);
        if (s.type) sel.setAttribute('type', s.type);
        if (s.title) sel.setAttribute('title', s.title);
        el.appendChild(sel);
      }
      for (const t of tracks) {
        this.appendTrack(el, t);
      }
      return el;
    },
    async initPlayer(el) {
      const self = this;
      const {commit, dispatch, state, getters} = this.$store;
      commit(SET_PLAYER_NATIVE_FULLSCREEN, mejs.Features.isAndroid || mejs.Features.isiOS || mejs.Features.isSafari);
      const {format, sources, tracks, autoplay, poster} = this.source;
      mejs.i18n.language(state.lang);
      const filePath = this.filePath;
      const file = this.file;
      // const event = this.$ga.event;

      const features = [];

      if (state.features.playpause)   features.push('playpause');
      if (state.features.currentTime) features.push('current');
      if (state.features.timeline)    features.push('progress');
      if (state.features.timeline)    features.push('availableprogress');
      if (state.features.duration)    features.push('duration');
      if (state.features.chromecast)  features.push('chromecast');
      if (state.features.volume)      features.push('volume');
      if (format == 'video') {
        if (state.features.settings)   features.push('settings');
        if (state.features.fullscreen) features.push('fullscreen');
        if (state.features.subtitles)  features.push('advancedtracks');
        if (state.features.continue)   features.push('continue');
        if (state.features.captions)   features.push('captions');
        if (state.features.embed)      features.push('embed');
        if (state.features.browse   && getters.isEmbedded) features.push('browse');
        features.push('error');
        // if (state.features.browse)     features.push('browse');
        // features.push('pausead');
      }

      if (getters.isEmbedded && self.displayAds) {
        features.push('logo');
      }

      if (state.features.download && (!self.displayAds || !getters.isEmbedded)) {
        features.push('download');
      }
      if (!window.Hls) {
        await loadScript('/hls.min.js');
      }

      class MyLoader extends window.Hls.DefaultConfig.loader {
        constructor(config) {
          super(config);
          var load = this.load.bind(this);
          this.load = async function (context, config, callbacks) {
            let url = new Url(context.url);
            let s = {};
            if (context.frag) {
              s = context.frag;
            }
            const fname = url.pathname.match(/([^\/]+\.[a-z0-9]+$)/)[0];
            context.url = await state.seeder.segmentUrl(getters.filePath, fname, s, getters.metadata);
            load(context, config, callbacks);
          };
      }

      }
      let loader = MyLoader;
      let resolveLoader = null;
      let loaderPromise = new Promise(function(resolve, reject) {
        resolveLoader = resolve;
      });

      if (self.completedPieces.length == 0) {
        const origLoad = loader.prototype.load;
        loader.prototype.load = async function(context, config, callbacks) {
          await loaderPromise;
          return origLoad.call(this, context, config, callbacks);
        }
      }
      // loader = wrapLoader(loader);

      dispatch('hls/updateSubtitles', []);
      dispatch('hls/updateAudio', []);
      self.updateAvailableDuration(0);
      self.updateDuration(0);

      let failedRecovers = 0;

      this.$player = new MediaElementPlayer(el, {
        store: this.$store,
        route: this.$route,
        features,
        autoplay,
        autoRewind: false,
        duration() {
          if (!self.cached && state.mediaInfo && state.mediaInfo.format && state.mediaInfo.format.duration) {
            self.updateDuration(state.mediaInfo.format.duration);
            return parseFloat(state.mediaInfo.format.duration);
          }
        },
        defaultSeekBackwardInterval: (media) => 15,
        defaultSeekForwardInterval: (media) => 15,
        hls: {
          store: this.$store,
          startPosition: 0,
          path: '/hls.min.js',
          autoStartLoad: autoplay,
          manifestLoadingTimeOut: 1000 * 60 * 10,
          manifestLoadingMaxRetry: 100,
          manifestLoadingMaxRetryTimeout: 1000 * 10,
          capLevelToPlayerSize: true,
          capLevelOnFPSDrop: true,
          progressive: true,
          testBandwidth: false,
          // abrEwmaDefaultEstimate: 50000000,
          // maxBufferSize: 0,
          // backBufferLength: 0,
          loader, 
          // liveSyncDurationCount: 7,
        },
        stretching: this.stretching,
        error: function(e) {
          dispatch('player/setError', e);
        },
        async success(media) {
          self.hlsPlayer = media.hlsPlayer;
          if (media.hlsPlayer) {
            media.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
              if (media.hlsPlayer.levels.length > 1) {
                media.hlsPlayer.startLevel = 1;
              }
            });
            media.hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
              // if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
              //   // a fragment could not load, even after retrying it X times. Give up and move on
              //   debug('Failed segment:', data.frag.relurl);
              //   debug('Attempting recovery', failedRecovers);
              //   failedRecovers++;
              //   if (failedRecovers > 10) {
              //     return;
              //   }
              //   if (media.getDuration() > media.currentTime + 60) {
              //     media.currentTime = data.frag.start + data.frag.duration + 10;
              //   }
              // }
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    // try to recover network error
                    debug('fatal network error encountered, try to recover');
                    media.hlsPlayer.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    debug('fatal media error encountered, try to recover');
                    media.hlsPlayer.recoverMediaError();
                    break;
                  default:
                    // cannot recover
                    media.hlsPlayer.destroy();
                    break;
                }
              }
            });
          }
          timerId = setInterval(function() {
            const d = media.getDuration();
            if (!isNaN(d)) {
              self.updateAvailableDuration(d);
            }
          }, 1000);
          media.addEventListener(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
            const groups = media.hlsPlayer.levels[0].textGroupIds;
            dispatch('hls/updateSubtitles', media.hlsPlayer.subtitleTracks.filter(s => groups.includes(s.groupId)));
            self.setSubtitle(state.player.subtitle);
          });
          
          media.addEventListener(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
            const groups = media.hlsPlayer.levels[0].audioGroupIds;
            dispatch('hls/updateAudio', media.hlsPlayer.audioTracks.filter(a => groups.includes(a.groupId)));
            self.setAudio(state.player.audio);
          });

          // if (p2pml.hlsjs.Engine.isSupported()) {
          //   p2pml.hlsjs.initMediaElementJsPlayer(media);
          // }
          // commit(SET_LOAD_STATE, 'prepare to play');
          let currentPositionSetted = false;

          // event('Show', 'LOADING', filePath);

          media.addEventListener('canplay', 
            async () => {
              if (!currentPositionSetted && format == 'video') {
                self.$player.currentTime = self.time;
                currentPositionSetted = true;
              }
              // commit(SET_LOAD_STATE, false);
              if (!self.loaded) {
                // event('Show', 'LOADED', filePath);
                self.loaded = true;
                await dispatch('getMediaInfo');
                if (state.features.autoSubtitles && !state.player.subtitle) {
                  await dispatch('processAutoSubtitles');
                }
              }
              if (self.$player.duration) dispatch('setDuration', self.$player.duration);
            });
          media.addEventListener('play',    () => self.updateStatus(PLAY));
          media.addEventListener('playing', () => self.updateStatus(PLAYING));
          media.addEventListener('pause',   () => self.updateStatus(PAUSE));
          media.addEventListener('ended',   () => {
              self.updateStatus(ENDED);
              if (format == 'audio') dispatch('nextFile');
          });
          media.addEventListener('timeupdate', () => {
            if (self.$player) {
              self.updateTime(file, self.$player.currentTime);
            }
          });
          media.addEventListener('seeking', () => {
            self.updateStatus(SEEKING);
            if (!self.firstPlay && self.hlsPlayer && self.hlsPlayer.loadLevel > 1) {
              self.hlsPlayer.loadLevel = 1;
            }
          });
          media.addEventListener('seeked', () => {
            self.updateStatus(SEEKED)
            if (!self.firstPlay && self.hlsPlayer) {
              self.hlsPlayer.loadLevel = -1;
            }
          });
          media.addEventListener('play', async () => {
            if (!self.firstPlay) return;
            if (resolveLoader) {
              resolveLoader();
            }
            self.firstPlay = false;
            dispatch('firstPlay');
          });
          dispatch('playerInited');
          // media.addEventListener('loadedmetadata', () => {});
        },
      });
			this.$player.container.addEventListener('controlsshown', () => {
        commit(SET_PLAYER_CONTROLS_SHOWN, true);
			});
			this.$player.container.addEventListener('controlshidden', () => {
        commit(SET_PLAYER_CONTROLS_SHOWN, false);
      });
      this.$player.container.addEventListener('enteringfullscreen', () => {
        commit(SET_PLAYER_FULLSCREEN, true);
      });
      this.$player.container.addEventListener('exitedfullscreen', () => {
        commit(SET_PLAYER_FULLSCREEN, false);
      });
      if (autoplay) {
        setTimeout(function() {
          self.$player.play();
        }, 0);
      }

    },
    async init() {
      if (this.source.sources.length == 0) {
        return;
      }
      const sourceUrl = this.source.sources[0].src.href;
      if (this.playerSourceUrl == sourceUrl) {
        return
      }
      this.updateStatus(IDLE);

      const {commit, dispatch, state, getters} = this.$store;
      commit(SET_PLAYER_FILE_PATH_SUCCESS, this.filePath);
      commit(SET_PLAYER_SOURCE_URL_SUCCESS, sourceUrl);
      this.drop();
      const self = this;

      const el = this.initEl();
      self.$refs.container.appendChild(el);
      await self.initPlayer(el);
    },
    drop() {
      this.dropPlayer();
      this.dropClient();
    },
    closeAd() {
      this.adClosed = true;
      this.adCloseLock = true;
      const self = this;
      setTimeout(() => {
        self.adCloseLock = false;
      }, 30 * 60 * 1000);
    },
  },
  mounted() {
    // this.dropPlayer();
    setTimeout(this.init, 0);
  },
  updated() {
    // this.dropPlayer();
    setTimeout(this.init, 0);
  },
  beforeDestroy() {
    this.drop();
  },
  deactivated() {
    this.drop();
  }
};
</script>

<style lang="scss">
@import "ui/src/scss/dark_variables";
.mejs__container.mejs__audio {
  background: none !important;
}

.me-player-not-first-play .mejs__overlay-play .mejs__overlay-button {
  opacity: 0;

}

.me-player-not-loaded .mejs__cast-button {
  display: none;
}

.mejs__overlay-error {
  display: none !important;
}

.me-player-non-native-fullscreen {
  video::-webkit-media-text-track-display {
    display: none !important;
    opacity: 0 !important;
  }
  video::cue {
    display: none !important;
    opacity: 0 !important;
  }
}
.mejs__time-current, .mejs__time-handle-content,
  .mejs__horizontal-volume-current {
  background: map-get($theme-colors, primary);
  opacity: 0.9;
}
$old-primary: $primary;

$width: 100px;

.loader {
  width: $width;
  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }
}

.circular {
  animation: rotate 2s linear infinite;
  height: 100px;
  transform-origin: center center;
  width: 100px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}

.path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
  stroke-linecap: round;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

@keyframes color {
  100%,
  0% {
    stroke: $headings-color;
  }
  40% {
    stroke: $old-primary;
  }
  66% {
    stroke: $secondary;
  }
  80%,
  90% {
    stroke: $primary;
  }
}
.mejs__horizontal-volume-current, .mejs__time-current, .mejs__time-handle-content {
  background-color: $headings-color;
  opacity: 1;
}
.mejs__time-total {
  background-color: $primary;
}
.mejs__horizontal-volume-slider {
  background-color: transparent !important;
}
.ad {
  border: $primary 1px solid;
  position: absolute;
  width: 302px;
  height: 252px;
  right: 15px;
  top: 70px; 
  background-size: contain;
  z-index: 1000;
  cursor: pointer;
  display: block;
  background-color: transparent !important;
  .ad-label {
    font-size: 0.8rem;
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    opacity: 0.3;
  }
}
.mejs__button > button {
  margin: 10px 6px !important;
}
.mejs__time-handle-content {
  border: map-get($theme-colors, primary);
}
.mejs__captions-layer {
  width: 100%;
}
.mejs__time {
  height:26px;
}
.mejs__sourcechooser-selector input {
    clear: both;
    float: left;
    left: -1000px;
    margin: 3px 3px 0 5px;
    position: absolute;
}
.mejs__sourcechooser-selector li {
    color: #fff;
    cursor: pointer;
    display: block;
    list-style-type: none !important;
    margin: 0 0 6px;
    overflow: hidden;
    padding: 0;
}
.mejs__sourcechooser-selector li.mejs__sourcechooser-selector-selected {
    color: rgba(33, 248, 248, 1);
}
.mejs__sourcechooser-selector label {
    cursor: pointer;
    float: left;
    font-size: 10px;
    line-height: 15px;
    padding: 4px 10px 0;
    width: 100%;
}
.mejs__controls {
  background-image: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.3)) !important;
}
.mejs__poster {
  background-size: contain;
}
video {
  object-fit: contain;
}
.close {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 32px;
  height: 32px;
  opacity: 1;
  z-index: 9999;
}
.close:hover {
  opacity: 1;
}
.close:before, .close:after {
  position: absolute;
  left: 15px;
  content: ' ';
  height: 33px;
  width: 2px;
  background-color: #666;
}
.close:before {
  transform: rotate(45deg);
}
.close:after {
  transform: rotate(-45deg);
}
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
.mejs__download-button button {
  background-image: url('../../../../assets/download.svg');
  width: 18px;
  height: 18px;
}
.mejs__embed {
  background: none;
}

.mejs__cast-button {
  position: absolute;
  top: 4px;
  right: 9px;
  z-index: 999999999;
  cursor: pointer;
}
.me-player.me-player-without-controls {
  .mejs__cast-button {
    display: none;
  }
}

.me-player-without-controls {
  .mejs__logo-button {
    display: none;
  }
}
.mejs__logo-button {
  position: absolute;
  bottom: 60px;
  left: 0px;
  z-index: 1;
}
.mejs__logo-button a {
  height: 20px;
  background-position-y: 8px;
  background-position-x: 10px;
  background-image: url('../../../../assets/logo.svg?fill=white');
  background-size: 40px 40px;
  color: white !important;
  padding-left: 57px;
  font-size: 1.6rem;
  width: 120px;
  white-space: nowrap;
  background-repeat: no-repeat;
  font-family: 'Libre Baskerville', serif;
  opacity: 0.3;
  padding-right: 10px;
  padding-top: 20px;
  position: relative;
  .pre {
    position: absolute;
    top: 11px;
    left: 57px;
    font-size: 0.85rem;
    letter-spacing: 0.04rem;
  }
  .text {
    position: relative;
    top: 1px;
  }
  &:hover {
    text-decoration: none !important;
    opacity: 1;
    color: white !important;
  }
}
.mejs__embed-button button {
  background: none;
  color: white;
  font-size: 0.8rem;
  white-space: nowrap;
  letter-spacing: 0.1rem;
  transform: scaleY(1.8);
  overflow: visible;
  .slash {
    padding-left: 0.07rem;
    padding-right: 0.07rem;
    position: relative;
    bottom: -0.04rem;
  }
  position: relative;
  left: -0.2rem;
}
</style>
