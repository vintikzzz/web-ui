<template>
    <div>
        <b-form-group :label="$t('common.subtitles')">
            <b-form-radio-group
                @change="onChange"
                v-model="selected"
                :options="options"
            ></b-form-radio-group>
        </b-form-group>
    </div>
</template>
<script>
import {mapState, mapGetters} from 'vuex';
export default {
    data() {
        return {
            selected: null,
        };
    },
    watch: {
        current(t) {
            if (!t) return;
            this.selected = t.hash;
        },
    },
    computed: {
        ...mapState({
            tracks: (state) => state.attachedTracks,
            current: (state) => state.player.subtitle,
        }),
        options() {
            const options = [];
            options.push({value: null, text: this.$t('common.nosubs')});
            for (const t of this.tracks) {
                const text = t.label;
                const value = t.hash;
                options.push({value, text});
            }
            return options;
        },
    },
    methods: {
        onChange(val) {
            let track = null;
            if (val != null) {
                for (const t of this.tracks) {
                    if (t.hash == val) {
                        track = t;
                        track.source = 'attached';
                        break;
                    }
                }
            }
            this.$store.dispatch('player/setSubtitle', track);
        },
    },
    created() {
        if (this.current) {
            this.selected = this.current.hash;
        }
    }
}

</script>
