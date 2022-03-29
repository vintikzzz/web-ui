<template>
  <div class="banner" :id=placeholder v-if="displayAdsense"></div> 
</template>
<script>
import {mapGetters, mapState} from 'vuex';
import debounce from 'lodash/debounce';
import bind from 'lodash/bind';
export default {
  data() {
    return {
      width: 0,
    };
  },
  props: ['ad-slot', 'ad-format', 'ad-style', 'ad-name'],
  computed: {
    ...mapGetters([
      'displayAdsense',
    ]),
    placeholder() {
      return 'adsense-ad-' + (this.adName ? this.adName : this.adSlot);
    },
  },
  methods: {
    initAdsense() {
      this.$store.dispatch('placeAdsenseAd', {
        slot:        this.adSlot,
        format:      this.adFormat,
        placeholder: this.placeholder,
        style:       this.adStyle,
        name:        this.adName,
      });
    },
    refresh() {
      this.initAdsense();
    },
    handleResize() {
      if (this.$el.clientWidth == this.width) return;
      this.width = this.$el.clientWidth;
      this.refresh();
    }
  },
  mounted() {
    this.initAdsense();
    const debouncedResize = debounce(bind(this.handleResize, this), 1000);
    window.addEventListener('resize', debouncedResize);
    const i = setInterval(() => {
      if (this.$el.clientWidth == 0) return;
      this.width = this.$el.clientWidth;
      clearInterval(i);
    }, 100);
  },
  updated() {
    this.initAdsense();
  },
  watch:{
    $route(to, from){
      this.refresh();
    }
  } 
}
</script>