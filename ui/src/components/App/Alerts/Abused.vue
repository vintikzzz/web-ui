<template>
  <b-alert variant="danger" :show="abused" v-html="$tm('errors.abused')">
  </b-alert>
</template>

<script>
import {mapState} from 'vuex';
export default {
  computed: {
    ...mapState({
      abused: (state) => state.abused,
    }),
  },
};
</script>
