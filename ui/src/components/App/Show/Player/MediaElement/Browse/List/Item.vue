<template>
    <b-button @click="onClick" :disabled="disabled" variant="outline-light">{{friendlyNameCutted}}</b-button>
</template>
<script>
export default {
  props: ['item'],
  computed: {
      friendlyName() {
          return this.item.friendlyName;
      },
      friendlyNameCutted() {
          if (this.item.friendlyName.length <= 15) {
            return this.friendlyName;
          } else {
            return this.item.friendlyName.substring(0, 15) + '...';
          }
      },
      name() {
          return this.item.name;
      },
      disabled() {
        return this.$store.state.file == this.name;
      }
  },
  methods: {
    async onClick() {
        await this.$store.dispatch('open', this.name);
    }
  }
}
</script>
<style lang="scss" scoped>
button {
    margin: 0.5rem;
}
</style>