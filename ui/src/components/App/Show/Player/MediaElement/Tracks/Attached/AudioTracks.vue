<template>
    <div>
        <b-form-group :label="$t('common.audio')">
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
            selected: 0,
        };
    },
    watch: {
        current(t) {
            if (!t) return;
            this.selected = t.id;
        },
    },
    computed: {
        ...mapState({
            tracks: (state) => state.hls.audio,
            current: (state) => state.player.audio,
        }),
        options() {
            const options = [];
            if (this.tracks.length == 0) {
                options.push({value: 0, text: this.$t('common.default')});
            }
            for (const t of this.tracks) {
                const text = t.label;
                const value = t.id;
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
                    if (t.id == val) {
                        track = t;
                        break;
                    }
                }
            }
            this.$store.dispatch('player/setAudio', track);
        },
    },
    created() {
        if (this.current) {
            this.selected = this.current.id;
        }
    }
}

</script>
