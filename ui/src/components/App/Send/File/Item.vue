<template>
    <a class="dropdown-item" :href="href" @click="onClick">{{ name }}</a>
</template>
<script>
import parseTorrent from 'parse-torrent';
export default {
    props: ['item'],
    computed: {
        name() {
            return this.item.name;
        },
        infoHash() {
            return this.item.infoHash;
        },
        magnet() {
            return parseTorrent.toMagnetURI({
                infoHash: this.infoHash,
            });
        },
        href() {
            const route = {
                query: {pwd: this.item.pwd, magnet: this.magnet},
                name:  this.$route.name,
                meta:  this.$route.meta,
                params: this.$route.params,
            };
            return this.$router.resolve(route).href;
        },
    },
    methods: {
        async onClick(e) {
            e.preventDefault();
            this.$emit('select', this.item);
        }
    }
}
</script>