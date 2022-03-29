<template>
    <a @click.stop.prevent="onDownload" class="btn my-btn-link">
        <span class="icon-wrapper"><icon name="download"></icon></span>{{ $tm('common.download') }}
    </a>
</template>

<script>
import 'vue-awesome/icons/download';
export default {
    methods: {
        async onDownload(e) {
            await this.$store.dispatch('zip');
        }
    }
}
</script>

<style lang="scss" scoped>
.icon-wrapper {
    padding-right: 0.3rem;
    display: inline-block;
    position: relative;
    top: -0.15rem;
    left: -0.15rem;
}
</style>