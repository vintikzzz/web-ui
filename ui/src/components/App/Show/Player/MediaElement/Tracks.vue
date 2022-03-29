<template>
    <div class="container">
        <b-button-group>
            <b-button
                v-for="(btn, name) in buttons"
                :key="name"
                :pressed="name == selected"
                variant="outline-light"
                @click="select(name)"
            >{{ btn.caption }}</b-button>
        </b-button-group>
        <div class="overflow-auto">
            <keep-alive>
                <component v-bind:is="buttons[selected].component"></component>
            </keep-alive>
        </div>
        <b-button class="track-close" variant="outline-light" @click="onClose">{{ $t('form.common.button.close') }}</b-button>
        <size class="track-size" />
    </div>
</template>
<style lang="scss" scoped>
.overflow-auto {
    height: calc(100% - 5rem);
    overflow-y: scroll;
    padding-top: 1rem;
}
.container {
    width: 80%;
    height: 80%;
    background: black;
    color: white;
    opacity: 0.9;
    padding: 1rem;
    position: relative;
}
.track-close {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
}
.track-size {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
}
</style>
<script>
const dragDrop = require('drag-drop');
import Attached from './Tracks/Attached.vue';
import OpenSubtitles from './Tracks/OpenSubtitles.vue';
import Upload from './Tracks/Upload.vue';
import Size from './Tracks/Size.vue';
export default {
    components: { Size },
    props: ['player'],
    computed: {
        initSelected() {
            const track = this.$store.state.player.subtitle;
            if (track && track.source) {
                return track.source;
            }
            return 'attached';
        },
    },
    data() {
        return {
            selected: null,
            buttons: {
                attached: {
                    caption: this.$t('common.attached'),
                    component: Attached,
                },
                openSubtitles: {
                    caption: 'OpenSubtitles',
                    component: OpenSubtitles,
                },
                upload: {
                    caption: 'Upload',
                    component: Upload,
                },
            },
        };
    },
    methods: {
        onClose() {
            this.$emit('close');
        },
        select(name) {
            this.selected = name;
        },
    },
    created() {
        dragDrop(this.player.container, async (files, pos) => {
            this.$emit('show');
            this.selected = 'upload';
            this.$store.dispatch('player/dropSubtitles', files);
        });
        this.selected = this.initSelected;
    },
}

</script>
