<template>
  <layout class="tool-layout">
    <h1>
      <div class="main-header"><slot name="header" /></div>
      <div class="sub-header"><slot name="lead" /></div>
    </h1>
    <div class="tool-wrapper">
      <div class="tool-content">
        <slot/>
      </div>
    </div>
    <div class="features">
      <slot name="features" />
    </div>
    <adsense-ad ad-name="tool" ad-format="auto" />
  </layout>
</template>

<script>
import Layout from './Default.vue';
import AdsenseAd from '../AdsenseAd.vue';
export default {
  components: {Layout, AdsenseAd},
  metaInfo() {
    if (this.$slots.header !== undefined) {
      return {
        title: this.$slots.header[0].text,
      };
    }
  },
}
</script>

<style lang="scss">
@import "ui/src/scss/dark_variables";
.tool-layout {
  .features {
    ul {
      list-style: none;
      line-height: 3rem;
      color: $stroke-color;
      font-size: 2rem;
      padding: 0;
    }
    padding-bottom: 1rem;
  }
  padding-bottom: 2rem;
}
@media (max-width: 576px) {
  .tool-layout {
    .features {
      ul {
        line-height: 2.5rem;
        font-size: 1.5rem;
      }
      padding-bottom: 1rem;
    }
    padding-bottom: 2rem;
  }
}
</style>
<style lang="scss" scoped>
h1, .features {
  text-align: center;
}
.tool-wrapper {
  padding-top: 4rem;
  padding-bottom: 4rem;
  display: flex;
  justify-content: center;
  .tool-content {
    max-width: 50rem;
    width: 100%;
  }
}
.main-header {
  font-size: 2.8rem;
  line-height: 2.8rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.25rem;
  margin-bottom: 0.2rem;
}
.sub-header {
  font-size: 1.7rem;
}

@media (max-width: 576px) {
  .main-header {
    font-size: 2rem;
  }
  .sub-header {
    font-size: 1.4rem;
  }
  .tool-wrapper {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}
</style>