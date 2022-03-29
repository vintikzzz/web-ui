<template>
  <label class="btn btn-primary btn-lg" role="button" @click="onClick">
    <span class="heart">❤️</span><span class="text">{{ $tm('common.donate') }}</span>
  </label>
</template>
<style lang="scss" scoped>
.heart {
  position: relative;
  top: 0.1rem;
  right: 0.4rem;
}
</style>
<script>
export default {
  methods: {
    onClick(e) {
        window.location = this.$store.state.sponsorURL;
    }
  }
}
</script>