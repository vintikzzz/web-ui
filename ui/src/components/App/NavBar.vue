<template>
  <b-navbar>
    <slot name="pre">
      <b-nav-item class="logo" to="/">{{$tm('common.domain')}}</b-nav-item>
    </slot>
    <b-navbar-nav class="ml-auto">
      <donate />
      <lang class="last" />
      <slot name="post" />
    </b-navbar-nav>
  </b-navbar>
</template>

<style lang="scss" scoped>
.logo {
  font-size: 1rem;
  font-family: 'Libre Baskerville', serif;
}
.logo a.nav-link {
  padding-left: 0rem !important;
  padding-right: 0.2rem !important;
  padding-bottom: 0rem;
  padding-top: 0rem;
}
.navbar {
  padding: 0.6rem;
  z-index: 1000;
  position: absolute;
  width: 100vw;
  padding-right: 1.2rem;
  padding-left: 1.2rem;
  align-items: flex-start;
  min-width: 320px;
}
.navbar-expand-md .navbar-nav {
  flex-direction: row;
}
.navbar-nav li {
  margin-right: 0.5rem;
}
.navbar-nav li.last {
  margin-right: 0rem;
}
</style>

<script>
import Lang from './NavBar/Lang.vue';
import Donate from './NavBar/Donate.vue';
export default {
  components: {Lang, Donate},
};

</script>
