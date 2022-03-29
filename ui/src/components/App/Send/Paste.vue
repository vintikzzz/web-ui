<template>
  <input type="text" @keyup="onKeyUp" @focus="onFocus"/>
</template>
<script>

export default {
  props: {
    done: {
      type: Function,
      default: () => [],
    },
  },
  methods: {
    async onKeyUp(e) {
      const torrent = await this.$store.dispatch('fetchTorrent', e.target.value);
      if (torrent) await this.$store.dispatch('fetchTorrent', torrent);
    },
    onFocus(e) {
      e.target.value = '';
    },
  },
};

</script>
