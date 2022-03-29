<template>
    <span v-if="isTranscode" :class="className" :style="style"></span>
</template>

<style lang="scss" scoped>
@import "ui/src/scss/dark_variables";
span {
    left: 0;
    transform: scaleX(0.5);
    transform-origin: 0 0;
    transition: 0.15s ease-in all;
    width: 100%;
    border-radius: 2px;
    cursor: pointer;
    display: block;
    height: 2px;
    position: absolute;
    bottom: 0px;
    background-color: $headings-color;
    opacity: 0.4;
}

</style>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
    props: ['options'],
    computed: {
        ...mapGetters([
            'deliveryType'
        ]),
        ...mapState({
            duration: (state) => state.player.duration,
            availableDuration: (state) => state.player.availableDuration,
        }),
        isTranscode() {
            return this.deliveryType == 'transcode';
        },
        progress() {
            if (this.isTranscode && this.duration && this.availableDuration) {
                return this.availableDuration / this.duration;
            }
            return 0;
        },
        style() {
            return `transform: scaleX(${this.progress});`
        },
        className() {
            return `${this.options.classPrefix}time-available`;
        }

    },
}
</script>