<template>
  <component v-if="source && !server" :is="currentView"></component>
</template>
<script>

import {mapState} from 'vuex';
export default {
  components: {
    MediaEl: () => import('./Player/MediaElement.vue'),
    ImageEl: () => import('./Player/Image.vue'),
  },
  computed: {
    ...mapState([
      'source',
      'server',
    ]),
    currentView() {
      if (this.source.format == 'image') {
        return 'image-el';
      } else {
        return 'media-el';
      }
    },
  },
};
</script>
