<template>
  <b-alert variant="success" :show="show" v-html="$tm('actions.download')">
  </b-alert>
</template>

<script>
import {mapState} from 'vuex';
export default {
  computed: {
    ...mapState({
      show: (state) => state.action == 'download' || state.action == 'zip',
    }),
  },
};
</script>
