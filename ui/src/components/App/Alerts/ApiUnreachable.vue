<template>
  <b-alert variant="warning" :show="apiUnreachable" v-html="message">
  </b-alert>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
  computed: {
    ...mapState([
      'apiUnreachable',
    ]),
    ...mapGetters([
      'apiUrl',
    ]),
    message() {
      let m = this.$tm('errors.api unreachable');
      let u = new URL(this.apiUrl);
      m = m.replace('{{apiDomain}}', u.hostname);
      return m;
    }
  },
};
</script>
