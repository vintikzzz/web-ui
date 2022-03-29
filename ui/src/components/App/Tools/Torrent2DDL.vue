<template>
    <layout>
        <template #header>{{ $t('nav.torrent to ddl') }}</template>
        <template #lead>{{ $t('torrent to ddl.lead') }}</template>
        <template #features>
            <ul>
                <li>{{ $t('torrent to ddl.features.no file size restrictions') }}</li>
                <li>{{ $t('torrent to ddl.features.no registration required') }}</li>
                <li>{{ $t('torrent to ddl.features.no software required') }}</li>
                <li>{{ $t('torrent to ddl.features.absolutely free') }}</li>
            </ul>
        </template>
        <template>
            <send />
        </template>
    </layout>
</template>

<script>
import Layout from '../Layouts/Tool.vue';
import Send from '../SendWithMagnet.vue';
export default {
    components: {Layout, Send},
}
</script>

<style lang="scss" scoped>
</style>