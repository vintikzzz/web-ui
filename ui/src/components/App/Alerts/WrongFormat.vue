<template>
  <b-alert variant="danger" :show="wrongFormat" dismissible
  @dismissed="clearWrongFormatError" v-html="$tm('errors.wrong torrent file')">
  </b-alert>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import {CLEAR_TORRENT_LOAD_ERROR} from '../../../lib/store/mutationTypes';
export default {
  computed: {
    ...mapState({
      wrongFormat: (state) => state.wrongFormat,
    }),
  },
  methods: {
    clearWrongFormatError(e) {
      this.$store.commit(CLEAR_TORRENT_LOAD_ERROR);
    }
  }
}
</script>
