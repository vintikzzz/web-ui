<template>
  <b-nav-item-dropdown class="lang" right
    :text="name">
    <item
      v-for="(item, index) in translations"
      :item="index"
      :index="index"
      :key="index"
    ></item>
  </b-nav-item-dropdown>
</template>

<style lang="scss">
.lang a.nav-link {
  padding: 0 !important;
}
</style>

<script>
import Item from './Lang/Item.vue';
import {mapGetters} from 'vuex';
export default {
  components: {Item},
  computed: {
    name() {
      return this.$tm('common.lang').toUpperCase();
    },
    ...mapGetters([
      'translations',
    ]),
  },
};
</script>
