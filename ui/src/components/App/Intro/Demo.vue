<template>
  <a @click.prevent.stop="onClick" v-html="$tm('common.open demo torrent')" />
</template>
<script>
export default {
  methods: {
    onClick(e) {
      this.$store.dispatch('fetchTorrent', '/sintel.torrent');
    },
  },
};
</script>
<style lang="scss" scoped>
a {
  cursor: pointer;
}
</style>
