<template>
  <div>
    <file :drop-right="dropRight" :no-magnet="noMagnet"></file>
    <drop></drop>
  </div>
</template>

<style>
</style>

<script>
import file from './Send/File.vue';
import drop from './Send/Drop.vue';
import paste from './Send/Paste.vue';
export default {
  props: {
    dropRight: Boolean,
    noMagnet: Boolean,
  },
  components: {file, drop, paste},
};
</script>
