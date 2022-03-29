<template>
  <div :class="groupClass" v-click-outside="closeDropdown">
    <label class="btn btn-primary btn-lg send-file" role="button">
      <span v-html="$tm('common.open torrent')" />
      <input ref="in" type="file" @change="onChange" hidden />
    </label>
    <button type="button" class="btn btn-primary btn-lg dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" @click="toggleDropdown">
      <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div :class="dropdownClass" ref="dropdown">
      <b-dropdown-form @submit.stop.prevent>
        <b-form-group v-if="!noMagnet">
          <icon class="magnet" name="magnet"></icon>
          <magnet @change="onMagnetChange" />
        </b-form-group>
      </b-dropdown-form>
      <b-dropdown-group v-if="hasRecentTorrents" :header="$t('common.latest torrents')">
        <item @select="onSelect"
          v-for="(item, index) in recentTorrents"
          :item="item"
          :index="index"
          :key="index"
        ></item>
      </b-dropdown-group>
      <b-dropdown-header v-if="!hasRecentTorrents">{{ $t('common.no recent torrents') }}</b-dropdown-header>
    </div>
  </div>
</template>
<style scoped lang="scss">
@import "ui/src/scss/dark_variables";
.magnet {
  position: absolute;
  left: 1.5rem;
  top: 1.2rem;
  color: $body-color;
}
fieldset {
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
}
input {
  width: calc(100% - 2rem) !important;
  margin-left: 1rem !important;
  padding-left: 2rem !important;
}
</style>
<script>
import {mapState, mapGetters} from 'vuex';
import Item from './File/Item.vue';
import Magnet from './Magnet.vue';
import 'vue-awesome/icons/magnet';
export default {
  props: {
    dropRight: Boolean,
    noMagnet: Boolean,
  },
  components: { Item, Magnet },
  computed: {
    ...mapGetters([
        'iOS',
    ]),
    groupClass() {
      let cl = 'btn-group';
      if (!this.noMagnet) {
        cl += ' with-magnet';
      } else {
        cl += ' without-magnet';
      }
      return cl;
    },
    dropdownClass() {
      let cl = 'dropdown-menu';
      if (this.dropRight) {
        cl += ' dropdown-menu-right';
      }
      return cl;
    },
    recentTorrents() {
      const {state} = this.$store;
      const vals = Object.values(state.recentTorrents);
      function compare(a, b) {
        if (a.timestamp > b.timestamp){
          return -1;
        }
        if (a.timestamp < b.timestamp){
          return 1;
        }
        return 0;
      }
      return vals.sort(compare).slice(0, 10);
    },
    hasRecentTorrents() {
      return this.recentTorrents.length > 0;
    },
  },
  mounted() {
    if (!this.iOS) {
      this.$refs.in.setAttribute('accept', '.torrent');
    }
  },
  methods: {
    async onChange(e) {
      const file = e.target.files[0];
      const torrent = await this.$store.dispatch('processFile', file);
      if (torrent) this.$store.dispatch('fetchTorrent', torrent);
      this.closeDropdown();
    },
    onMagnetChange() {
      this.closeDropdown();
    },
    showDropdown() {
      if (this.$refs.dropdown !== undefined) {
        this.$refs.dropdown.style.display = 'block';
      }
    },
    closeDropdown() {
      if (this.$refs.dropdown !== undefined) {
        this.$refs.dropdown.style.display = '';
      }
    },
    isDropdownVisible() {
      return this.$refs.dropdown !== undefined && this.$refs.dropdown.style.display != '';
    },
    toggleDropdown(e) {
      if (this.isDropdownVisible()) {
        this.closeDropdown();
      } else {
        this.showDropdown();
      }
    },
    async onSelect(item) {
      const {dispatch, commit} = this.$store;
      const torrent = await dispatch('getRecentTorrent', item.infoHash);
      dispatch('fetchTorrent', torrent);
      this.closeDropdown();
    }
  },
};

</script>
