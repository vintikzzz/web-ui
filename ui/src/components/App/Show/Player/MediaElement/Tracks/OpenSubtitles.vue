<template>
    <div>
        <div v-if="loading">{{ $t('common.loading') }}</div>
        <div v-if="empty">{{ $t('common.nothing found') }}</div>
        <b-form-group>
            <b-form-radio-group
                @change="onChange"
                v-model="selected"
                :options="options"
            ></b-form-radio-group>
        </b-form-group>
        <div class="osdb" v-if="hasTracks" v-html="$tm('osdb.reference')" />
    </div>
</template>
<style lang="scss" scoped>
.osdb {
    font-size: 0.8rem;
}

</style>
<script>
export default {
    data() {
        return {
            selected: null,
            options: [],
            loading: true,
            empty: false,
            tracks: [],
        };
    },
    computed: {
        hasTracks() {
            return this.tracks.length;
        },
        initSelected() {
            const track = this.$store.state.player.subtitle;
            if (track && track.hash && track.source == 'openSubtitles') {
                return track.hash;
            }
            return null;
        },
    },
    watch: {
        initSelected() {
            this.selected = this.initSelected;
        },
    },
    methods: {
        onChange(val) {
            let track = null;
            if (val != null) {
                for (const t of this.tracks) {
                    if (t.hash == val) {
                        track = t;
                        track.source = 'openSubtitles';
                        break;
                    }
                }
            }
            this.$store.dispatch('player/setSubtitle', track);
        },
    },
    async created() {
        const options = [];
        options.push({value: null, text: this.$t('common.nosubs')});
        const tracks = await this.$store.getters.openSubtitlesTracks;
        for (const t of tracks) {
            const text = t.label;
            const value = t.hash;
            options.push({value, text});
        }
        if (options.length == 0) {
            this.empty = true;
        }
        this.options = options;
        this.loading = false;
        this.selected = this.initSelected;
        this.tracks = tracks;
    }
}

</script>
