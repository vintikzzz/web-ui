<template>
  <div class="intro" v-if="!isEmbedded">
    <nav-bar>
      <template #pre><div /></template>
    </nav-bar>
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col lg="12">
          <div class="text-center">
            <logo class="logo" />
          </div>
        </b-col>
      </b-row>
    </b-container>
    <b-container>
      <b-row>
        <b-col lg="12">
          <b-jumbotron>
              <template #header><div v-html="$tm('intro.header')" class="main-header text-center"></div><div v-html="$tm('intro.header2')" class="sub-header text-center"></div></template>
              <template #lead><span v-html="$tm('intro.lead')" /></template>
                <send />
              <!-- <b-button-group>
                <sponsor />
              </b-button-group> -->
            <demo class="demo" />
            <login v-if="hasLogin" class="login" />
          </b-jumbotron>
        </b-col>
      </b-row>
      <div class="features">
        <b-row class="adsense justify-content-md-center">
          <b-col lg="10" v-if="displayAdsense">
            <adsense-ad ad-name="introTop" ad-format="auto" />
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="6">
            <feature name="extension" />
          </b-col>
          <b-col lg="6">
            <feature name="subtitles" />
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="6">
            <feature name="instant streaming" />
          </b-col>
          <b-col lg="6">
            <feature name="on-the-fly transcoding" />
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="6">
            <feature name="download zip" />
          </b-col>
          <b-col lg="6">
            <feature name="player" />
          </b-col>
        </b-row>
      </div>
      <div class="badges">
        <a href="https://www.producthunt.com/posts/webtor?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-webtor" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=295353&theme=dark" alt="Webtor - Download and play torrents with free cloud BitTorrent client | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
      </div>
      <hr />
      <div class="faq">
        <b-row>
          <b-col lg="12">
            <h2>{{$tm('intro.faq')}}</h2>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="12">
            <feature name="safe" />
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="12">
            <feature name="donate" />
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="12">
            <feature name="mobile" />
          </b-col>
        </b-row>
      </div>
      <hr />
      <div class="adsense-bottom" v-if="displayAdsense">
        <b-row>
          <b-col lg="12">
            <adsense-ad ad-name="introBottom" ad-format="auto" />
          </b-col>
        </b-row>
      </div>
    </b-container>
    <adsense-ad class="sticky-ad" ad-name="introLeftSticky" ad-format="auto" v-if="displayAdsense && windowWidth > 1425" />
  </div>
</template>

<style lang="scss">
@import "ui/src/scss/dark_variables";
.jumbotron {
  .input-group-append .send-file {
    border-radius: 0rem;
  }
}

.faq {
  .row {
    padding-top: 1rem;
  }
  h3 {
    font-size: 1.5rem;
  }
}
</style>

<style scoped lang="scss">
@import "ui/src/scss/dark_variables";
.logo {
  padding-top: 3rem;
}
.sticky-ad {
  width: 240px;
  position: fixed;
  left: 0rem;
  bottom: 5rem;
}
.badges {
  text-align: center;
  padding-top: 1rem;
  a {
    background: transparent !important;
  }
}
.adsense {
  padding-left: 15px;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
@media (min-width: 992px) {
  .features {
    .row {
      display:flex;
      flex-direction:row;
      flex-wrap: nowrap;
      margin-bottom: 1rem;
      .col-lg-10 {
        border-right: solid 1px $primary !important;
        margin-right: 0.7rem;
        border-left: solid 1px $primary !important;
        margin-left: 0.7rem;
        border-radius: 1rem;
        padding: 1rem;
      }
      .col-lg-6 {
        flex: 1 1 auto;
        border-radius: 1rem;
        padding: 1rem;
        &:first-child {
          text-align: right;
          // margin-top: -4rem;
          border-right: solid 1px $primary !important;
          margin-right: 0.7rem;
        }
        &:last-child {
          // margin-left: 1.5rem;
          border-left: solid 1px $primary !important;
          margin-left: 0.7rem;
        }
      }
    }
  }
}
.jumbotron {
  border-radius: 1rem;
  margin-bottom: 4rem;
}
.large {
  margin-bottom: 1.6rem;
  margin-top: 1.6rem;
}
.demo {
  margin-bottom: 0.8rem;
}
.login {
  float: right;
}
.alert {
  margin-bottom: 2rem;
}
.alert a {
  color: darkgoldenrod;
}

.row {
  margin-right: 0px;
}

@media (max-width: 576px) {
  .jumbotron {
    padding: 1em;
    margin-bottom: 2rem;
    border-radius: 0px;
    // padding-right: 30px;
  }
  .login {
    float: none;
  }
  .demo {
    display: inline-block;
  }
}
@media (min-width: 576px) {
  .jumbotron {
    padding: 2em;
    padding-bottom: 1rem;
  }
}
.adsense {
  margin-top: -1rem;
  // .col-lg-10 {
  //   background: red;
  // }
}
@media (max-width: 576px) {
  .jumbotron {
    border-radius: 0rem;
    border-left: none;
    border-right: none;
  }
}
.app-lang-en {
  .jumbotron {
    h1 .main-header {
      font-size: 2.7rem;
      // text-shadow: 2px 2px darken($logo-primary, 5%);
      // text-align: center;
    }
  }
}
.jumbotron {
  h1 {
    .main-header {
      font-size: 2.8rem;
      line-height: 2.8rem;
      // line-height: 3rem;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 0.25rem;
      // text-shadow: 2px 2px darken($logo-primary, 5%);
      margin-bottom: 0.2rem;
      // text-align: center;
    }
    .sub-header {
      font-size: 1.7rem;
      // line-height: 0rem;
      // text-transform: uppercase;
    }
  }
  .lead {
    margin: 1rem 0rem;
    letter-spacing: 0.1rem;
    span {
      display: block;
      text-align: center;
    }
  }
  .btn-group {
    padding-top: 0.6rem;
    display: block;
    .left {
      display: inline-block;
      margin-right: 1rem;
    }
    .right {
      display: inline-block;
    }
  }
}
.jumbotron {
  background-color: transparent;
}
h2 {
  text-transform: uppercase;
}
.col-lg-6 {
  margin-bottom: 1rem;
}
.faq h2 {
  color: $stroke-color;
  text-align: center;
}
@media (max-width: 992px) {
  .faq h2 {
    text-align: left;
  }
}
@media (max-width: 576px) {
  .faq h2 {
    padding-left: 1rem;
  }
}
</style>

<script>
import AdsenseAd from './AdsenseAd.vue';
import Feature from './Intro/Feature.vue';
import Send from './SendWithMagnet.vue';
import Magnet from './Send/Magnet.vue';
import Sponsor from './Sponsor.vue';
import Demo from './Intro/Demo.vue';
import Login from './Login.vue';
import Logo from './Logo.vue';
import NavBar from './NavBar.vue';
import {mapGetters, mapState} from 'vuex';
export default {
  components: {AdsenseAd, Feature, Send, Demo, Sponsor, Login, Magnet, Logo, NavBar},
  computed: {
    ...mapGetters([
      'blogUrl',
      'isEmbedded',
      'displayAdsense',
      'hasLogin',
    ]),
    ...mapState({
      windowWidth: (state) => state.windowWidth,
    }),
    sponsorURL() {
      return this.$store.state.sponsorURL;

    }
  },
}
</script>
