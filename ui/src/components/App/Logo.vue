<template>
  <h1 @click="clear">
    <span class="icon-back">
      <span class="icon" />
    </span>
    <span class="name" v-html="$tm('common.name')" />
  </h1>
</template>

<style scoped lang="scss">
@import "ui/src/scss/dark_variables";
$size: 75px;
.icon-back {
  width: $size;
  height: $size;
  margin-bottom: -11px;
  margin-right: 0px;
  position: relative;
  display: inline-block;
  border-radius: 0.3rem;
  background-color: $headings-color;
  margin-right: 5px;
}
.icon {
  position: absolute;
  left: 0;
  top: 0;
  width: $size;
  height: $size;
  background-size: $size $size;
  background-image: url('../../assets/logo.svg?fill=#{$logo-primary}');
  display: inline-block;
  border-radius: 0.3rem;
}
.name {
  color: $body-color;
  font-family: 'Libre Baskerville', serif;
}
h1 {
  user-select: none;
  cursor: pointer;
  padding-bottom: 2rem;
  padding-top: 2.5rem;
  font-size: 6.5rem;
}
@media (max-width: 576px) {
  $size: 53px;
  h1 {
    font-size: 4.5rem;
    padding-bottom: 0rem;
    padding-top: 0rem;
    min-width: 350px;
  }
  .icon-back {
    width: $size;
    height: $size;
    margin-bottom: -7px;
    margin-right: 3px;
  }
  .icon {
    width: $size;
    height: $size;
    background-size: $size $size;
  }
}
</style>

<script>
export default {
  methods: {
    async clear() {
      const {dispatch, state} = this.$store;
      if (state.loadState) return;
      await dispatch('setState', {});
      await dispatch('pushState');
    },
  },
};
</script>
