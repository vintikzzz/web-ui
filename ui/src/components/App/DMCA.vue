<template>
  <layout>
    <h1>DMCA</h1>
    <div v-html="dmca" />
  </layout>
</template>
<script>
import Layout from './Layouts/Default.vue';
export default {
  components: {Layout},
  computed: {
    dmca() {
      let title = this.$store.getters.title;
      let dmca = require('../../md/DMCA.md');
      dmca = dmca.split('YOURSITE').join('<strong>' + title + '</strong>');
      dmca = dmca.split('http://www.watchdogsecurity.online').join('<a href="http://www.watchdogsecurity.online">http://www.watchdogsecurity.online</a>');
      return dmca;
    }
  },
  metaInfo() {
    return {
      title: 'DMCA',
    };
  },
}
</script>