<template>
  <b-list-group flush>
    <b-list-group-item v-if="displayAdsense" class="adsense">
      <adsense-ad ad-name="showTop" ad-format="auto" />
    </b-list-group-item>
    <item
      v-for="(item, index) in items"
      :item="item"
      :index="index"
      :key="item.name"
    ></item>
  </b-list-group>
</template>

<style lang="scss" scoped>
.adsense {
  padding: 0 !important;
  // border-top: none !important;
}

</style>

<script>
import AdsenseAd from '../AdsenseAd.vue';
import Item from './List/Item.vue';
import {mapGetters} from 'vuex';
export default {
  components: {AdsenseAd, Item},
  props: ['items'],
  computed: {
    ...mapGetters([
      'displayAdsense',
    ]),
  },
};
</script>
