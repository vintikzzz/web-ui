<template>
    <div class="progress-bar" ref="nanobar" />
</template>

<script>
import Nanobar from 'nanobar';
export default {
    computed: {
        progress() {
            return this.$store.state.progress;
        },
    },
    watch: {
        progress(a) {
            if (this.n) this.n.go(a);
        },
    },
    mounted() {
        this.n = Nanobar({
            target: this.$refs.nanobar,
        });
    }
}
</script>

<style lang="scss">
@import "ui/src/scss/dark_variables";
.progress-bar {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 999999;
}
.nanobar .bar {
    height: 0.2rem;
    background: linear-gradient(90deg, $headings-color 0%, darken($headings-color, 10%) 50%, $headings-color 100%);
    background-size: 200%;
    animation: colors 2s linear infinite;
}
@keyframes colors {
    0% {
        background-position: 0% 0%;
    }
    100% {
        background-position: -200% 0%;
    }
}
</style>