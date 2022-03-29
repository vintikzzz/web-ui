<template>
</template>

<style>
html, body {
    margin: 0;
    height: 100%;
}
</style>

<script>
const dragDrop = require('drag-drop');
export default {
  async mounted() {
    const self = this;
    dragDrop(window.document.body, async (files, pos) => {
      const torrent = await self.$store.dispatch('processFile', files[0]);
      if (torrent) self.$store.dispatch('fetchTorrent', torrent);
    });
  },
};
</script>
