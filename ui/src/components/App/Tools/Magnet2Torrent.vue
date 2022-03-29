<template>
    <layout>
        <template #header>{{ $t('nav.magnet to torrent') }}</template>
        <template #lead>{{ $t('magnet to torrent.lead') }}</template>
        <template>
            <magnet size="lg" />
        </template>
    </layout>
</template>

<script>
import Layout from '../Layouts/Tool.vue';
import Magnet from '../Send/Magnet.vue';
export default {
    components: {Layout, Magnet},
}
</script>

<style lang="scss" scoped>
</style>