<template>
  <div class="default-layout">
    <nav-bar class="nav" />
    <div class="content">
      <b-container>
        <b-row>
          <b-col lg="12">
            <slot name="default" />
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>
<script>
import NavBar from './../NavBar.vue';
export default {
  components: {NavBar},
}
</script>

<style lang="scss">
.default-layout {
  .col-lg-12 {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>

<style lang="scss" scoped>
.content {
  padding-top: 3rem;
}

@media (max-width: 576px) {
  .content {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>