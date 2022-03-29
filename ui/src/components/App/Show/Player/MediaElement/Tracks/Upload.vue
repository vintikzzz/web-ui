<template>
    <div>
        <div v-if="tracks.length == 0">{{ $t('common.nothing found') }}</div>
        <b-form-group>
            <b-form-radio-group
                @change="onChange"
                v-model="selected"
                :options="options"
            ></b-form-radio-group>
        </b-form-group>
        <b-button variant="outline-light" class="add-button" size="sm" @click="onAdd">{{ $t('form.common.button.add') }}</b-button>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
const md5 = require('md5');
export default {
    data() {
        return {
            tracks: [],
            selected: null,
            options: [],
        };
    },
    methods: {
        onChange(val) {
            let track = null;
            if (val != null) {
                for (const t of this.tracks) {
                    if (t.hash == val) {
                        track = t;
                        track.source = 'upload';
                        break;
                    }
                }
            }
            this.$store.dispatch('player/setSubtitle', track);
        },
        getText(file) {
            return new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onloadend = function () {
                    resolve(reader.result);
                };
                reader.onerror = function (error) {
                    reject(error);
                };
            });
        },
        b64EncodeUnicode(str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
            }));
        },
        onAdd() {
            const self = this;
            const input = document.createElement('input');
            input.type = 'file';
            if (!this.iOS) {
                input.accept = '.srt,.vtt';
                input.multiple = true;
            }
            const evt = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            const canceled = !input.dispatchEvent(evt);
            input.onchange = async function(e) {
                if (this.files.length == 0) return;
                if (self.options.length == 0) {
                    self.options.push({value: null, text: self.$t('common.nosubs')});
                }
                for (const f of this.files) {
                    await self.addTrack(f);
                }
                if (self.tracks.length == 1) {
                    self.selected = self.tracks[0].hash;
                    self.onChange(self.tracks[0].hash);
                }
            };
        },
        async addTrack(file) {
            const res = await this.getText(file);
            const track = {};
            track.kind = 'subtitles';
            track.label = file.name;
            track.srclang = 'en';
            const sdk = this.$store.getters.sdk;
            const src = `data:text/plain;base64,${this.b64EncodeUnicode(res)}`;
            track.src = await sdk.ext.streamUrl(src, {}, {fileName: file.name});
            track.hash = md5(res);
            this.tracks.push(track);
            this.options.push({text: track.label, value: track.hash});
        },
        async processDrops() {
            if (this.drops.length == 0) return;
            if (this.options.length == 0) {
                this.options.push({value: null, text: this.$t('common.nosubs')});
            }
            for (const d of this.drops) {
                this.addTrack(d);
            }
            if (this.tracks.length == 1) {
                this.selected = this.tracks[0].hash;
                this.onChange(this.tracks[0].hash);
            }
            this.$store.dispatch('player/clearSubtitleDrops');
        }
    },
    watch: {
        initSelected() {
            this.selected = this.initSelected;
        },
        drops() {
            this.processDrops();
        },
    },
    computed: {
        ...mapState({
            drops: (state) => state.player.dropSubtitles,
        }),
        ...mapGetters([
            'iOS',
        ]),
        initSelected() {
            const track = this.$store.state.player.subtitle;
            if (track && track.hash && track.source == 'upload') {
                return track.hash;
            }
            return null;
        },
    },
    async created() {
        const track = this.$store.state.player.subtitle;
        if (track && track.hash && track.source == 'upload') {
            this.options.push({value: null, text: this.$t('common.nosubs')});
            this.tracks.push(track);
            this.options.push({text: track.label, value: track.hash});
            this.selected = track.hash;
        }
    },
    async mounted() {
        this.processDrops();
    },
}
</script>

<style lang="scss" scoped>
</style>