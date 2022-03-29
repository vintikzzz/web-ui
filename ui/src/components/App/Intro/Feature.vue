<template>
  <div class="feature">
    <h3 v-html="$tm(`intro.${name}.header`)" />
    <div class="body" v-html="text" />
  </div>
</template>

<style scoped lang="scss">
h3 {
  font-size: 1.75rem;
  margin-bottom: 0.7rem;
  // white-space: nowrap;
}
.body {
  // color: lighten(black, 35%);
  font-size: 1.2rem;
}
@media (max-width: 576px) {
  .feature {
    padding-left: 1em;
    padding-right: 1em;
  }
}
</style>


<script>
export default {
  props: ['name'],
  computed: {
    text() {
      let title = this.$store.getters.title.replace(/\.[a-z]+$/, '');
      title = title.charAt(0).toUpperCase() + title.slice(1);
      return this.$tm(`intro.${this.name}.body`).split('Webtor').join(title);
    }
  }
}
</script>
