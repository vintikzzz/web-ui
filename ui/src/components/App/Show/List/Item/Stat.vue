<template>
  <div :class="className">
      <div class="pieces-container">
        <svg class="pieces" :viewBox="`0 0 ${this.progressLength} 100`" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" :width="this.progressLength" height="100" opacity="0.3" />
          <rect :x="s.start" y="0" :width="s.end - s.start" height="100" v-for="s in this.highPrioritySegments" opacity="0.3" />
          <rect :x="s.start" y="0" :width="s.end - s.start" height="100" v-for="s in this.completedSegments" />
        </svg>
      </div>
      <!-- <div class="download-progress" :style="'width: ' + completed / total * 100 + '%'" v-if="download" /> -->
      <div class="web-seeder">
        {{ webSeederMessage }}
      </div>
      <div v-if="showTranscoderMessage && !download" class="transcoder">
        {{ transcoderMessage }}
      </div>
  </div>
</template>

<style lang="scss" scoped>
  @import "ui/src/scss/dark_variables";
  svg.pieces {
    fill: $headings-color;
  }
  .stats {
    position: relative;
    top: 6px;
    font-size: 0.65em;
    white-space: nowrap;
  }
  .web-seeder {
    position: relative;
    top: 3px;
  }
  .transcoder {
    position: relative;
    top: 3px;
  }
  .pieces {
    height: auto;
    width: 100%;
  }
  .pieces-container {
    height: 3px;
    overflow-y: hidden;
  }
  .download-progress {
    width: 100%;
    height: 3px;
    position: absolute;
    top: 0px;
    background-color: $logo-primary;
  }
</style>

<script>
import piecesToSegments from '../../../../../lib/piecesToSegments';
import {mapState, mapGetters} from 'vuex';
const numeral = require('numeral');
export default {
  props: ['path', 'download'],
  computed: {
    ...mapState({
        duration: (state) => state.player.duration ? numeral(state.player.duration).format('00:00:00') : '?',
        availableDuration: (state) => numeral(state.player.availableDuration).format('00:00:00'),
        stat: (state) => state.stats,
        torrent: (state) => state.torrent,
        torrentCompletedPieces: (state) => state.completedPieces,
        downloadStats: (state) => state.downloadStats,
    }),
    className() {
      let cl = 'stats';
      if (this.isCompleted) {
        cl += ' stats-completed';
      }
      return cl;
    },
    webSeederMessage() {
      return `${this.state}... ${numeral(this.completed).format('0.0b')} ${this.$t('stat.from')} ${numeral(this.total).format('0.0b')} [${this.$tc('stat.peer', this.peers, {n: this.peers})}]`;
    },
    transcoderMessage() {
      return `${this.$t('stat.transcoding')}... ${this.availableDuration} ${this.$t('stat.from')} ${this.duration}`;
    },
    showTranscoderMessage() {
      if (this.stat && this.$store.getters.mediaType == 'video' && this.$store.getters.deliveryType == 'transcode') {
        return true;
      }
      return false;
    },
    downloadStat() {
      // if (this.download && this.downloadStats[this.path]) {
      //   return this.downloadStats[this.path];
      // } else {
        return false;
      // }
    },
    state() {
      if (this.isCompleted) {
        return this.$t('stat.completed');
      } else if (this.isCached) {
        return this.$t('stat.seeding');
      } else if (this.stat) {
        return this.$t('stat.' + this.stat.statusName.toLowerCase().replace(/_/g, ' '));
      }
      return this.$t('stat.waiting');
    },
    piecesList() {
      const t = this.torrent;
      let file = null;
      let o = null;
      let l = 0;
      for (const f of t.files) {
        if (('/' + f.path).startsWith(this.path)) {
          if (o === null || f.offset < o) {
            o = f.offset;
          }
          l += f.length;
        }
      }
      if (l == 0) {
        return [];
      }
      let offset = 0;
      var pieces = [];
      var position = 0;
      var torrentPos = 0;
      // var t0 = performance.now()
      let completed = [];
      let prioritized = [];
      if (this.stat && this.stat.piecesList) {
        for (const sp of this.stat.piecesList) {
          if (sp.complete) completed.push(sp.position);
          if (sp.priority > 1) prioritized.push(sp.position);
        }
      }
      for (const p of t.pieces) {
        if (
          (o >= offset && o < offset + t.pieceLength) ||
          (offset > o && offset < o + l)
        ) {
          let effectiveLength = t.pieceLength;
          if (offset < o) {
            effectiveLength -= o - offset;
          }
          if (o + l < offset + t.pieceLength) {
            effectiveLength -= offset + t.pieceLength - o - l;
          }
          let complete = false;
          let priority = false;
          const cached = this.torrentCompletedPieces.includes(p)
          if (cached) complete = true;
          if (this.stat && !complete) {
            complete = completed.includes(torrentPos);
          }
          if (this.stat && !complete) {
            priority = prioritized.includes(torrentPos);
          }
          pieces.push({
            position,
            offset,
            complete,
            effectiveLength,
            cached,
            priority,
          });
          position++;
        }
        offset += t.pieceLength;
        torrentPos++;
      }
      // var t1 = performance.now()
      // console.log(`Call to piecesList took ${(t1 - t0)} milliseconds count ${pieces.length}.`)
      return pieces;
    },
    completedPieces() {
      return this.piecesList.filter((p) => p.complete);
    },
    highPriorityPieces() {
      return this.piecesList.filter((p) => p.priority);
    },
    highPrioritySegments() {
      return piecesToSegments(this.highPriorityPieces, this.piecesLength, this.progressLength);
    },
    completedSegments() {
      return piecesToSegments(this.completedPieces, this.piecesLength, this.progressLength);
    },
    cachedPieces() {
      return this.piecesList.filter((p) => p.cached);
    },
    isCached() {
      return this.cachedPieces.length > 0;
    },
    progressLength() {
      return 500;
    },
    piecesLength() {
      return this.piecesList.length;
    },
    peers() {
      if (this.stat) {
        return this.stat.peers;
      }
      if (this.isCached) {
        return 1;
      }
      return 0;
    },
    // speed() {
    //   return numeral(this.stat.speed).format('0.0b') + '/s';
    // },
    completed() {
      // if (this.download) {
      //   if (this.downloadStat) {
      //     return this.downloadStat.downloaded;
      //   } else {
      //     return 0;
      //   }
      // }
      return this.completedPieces.reduce((o, e) => o + e.effectiveLength, 0);
    },
    total() {
      // if (this.download && this.downloadStat && this.downloadStat.length) {
      //   return this.downloadStat.length;
      // }
      return this.piecesList.reduce((o, e) => o + e.effectiveLength, 0);
    },
    isCompleted() {
      return this.completed >= this.total;
    }
  }
}
</script>
