<template>
  <b-alert variant="danger" :show="loadError" v-html="$tm(error)">
  </b-alert>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
  computed: {
    ...mapState({
      loadError: (state) => state.loadError,
    }),
    ...mapGetters([
      'isEmbedded',
    ]),
    error() {
      return 'errors.' + (this.isEmbedded ? 'load embedded' : 'load');
    },
  },
};
</script>
