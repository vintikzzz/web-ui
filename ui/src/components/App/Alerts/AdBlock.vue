<template>
  <b-alert variant="warning" :show="adblock && !isSponsor && !isEmbedded" v-html="$tm('errors.adblock')">
  </b-alert>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
  computed: {
    ...mapState({
      adblock: (state) => state.adblock,
    }),
    ...mapGetters([
      'isSponsor',
      'isEmbedded',
    ]),
  },
};
</script>
