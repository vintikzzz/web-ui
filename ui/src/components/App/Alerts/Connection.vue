<template>
  <b-alert variant="danger" :show="!connected" v-html="$tm('errors.disconnect')">
  </b-alert>
</template>

<script>
import {mapState} from 'vuex';
export default {
  computed: {
    ...mapState({
      connected: (state) => state.socket.connected,
    }),
  }
}
</script>
