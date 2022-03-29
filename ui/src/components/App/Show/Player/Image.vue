<template>
  <img :src="src" />
</template>

<script>
import {SET_PLAYER_STATUS_SUCCESS,
        SET_PLAYER_FILE_PATH_SUCCESS} from '../../../../lib/store/mutationTypes';
import {ENDED} from '../../../../lib/store/playerStatusTypes';
import {mapState, mapGetters} from 'vuex';
export default {
  computed: {
    ...mapState({
      file: (state) => state.file,
      src: (state) => state.source.sources[0].src,
    }),
    ...mapGetters([
      'filePath',
    ]),
  },
  methods: {
    loaded() {
      this.$store.commit(SET_PLAYER_FILE_PATH_SUCCESS, this.filePath);
      this.$store.commit(SET_PLAYER_STATUS_SUCCESS, ENDED);
      const {dispatch} = this.$store;
      dispatch('updateFileState', this.file);
      dispatch('firstPlay');
    }
  },
  mounted() {
    if (this.$el.complete) {
      this.loaded();
    } else {
      this.$el.addEventListener('load', this.loaded);
    }
  }
};
</script>

<style scoped lang="scss">
@import "../../../../scss/custom.scss";
img {
  width: 100%;
  margin: 0px;
  padding: 0px;
  height: 100%;
  min-height: 4.5rem;
}

</style>
