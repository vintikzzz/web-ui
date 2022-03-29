<template>
  <b-dropdown-item :active="isActive" :href="href" @click.prevent="onClick">{{ name }}</b-dropdown-item>
</template>

<script>
import {getLangRoute} from '../../../../lib/langRoutes';
import {mapGetters} from 'vuex';
export default {
  props: ['item'],
  computed: {
    ...mapGetters([
      'translations',
    ]),
    name() {
      return this.translations[this.item]['common.lang'].toUpperCase();
    },
    route() {
      return getLangRoute(this.$route, this.item);
    },
    href() {
      return this.$router.resolve(this.route).href;
    },
    isActive() {
      return this.item == this.$tm('common.lang');
    },
  },
  methods: {
    onClick(e) {
      if (this.isActive) return;
      this.$router.push(this.route);
    },
  },
};
</script>
