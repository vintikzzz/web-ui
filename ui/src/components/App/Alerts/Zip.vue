<template>
  <b-alert variant="warning" :show="zipDownload && isWindows" v-html="$tm('errors.win zip')">
  </b-alert>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
    computed: {
        ...mapState([
            'zipDownload',
        ]),
        ...mapGetters([
            'isWindows',
        ]),
    },
};
</script>
