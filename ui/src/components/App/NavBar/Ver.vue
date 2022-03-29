<template>
    <div class="ver">
        <b-nav-item :href="href">{{version}}</b-nav-item>
    </div>
</template>

<style lang="scss" scoped>
.ver a {
    padding: 0;
    font-family: monospace, monospace;
    font-size: 0.9rem;
    color: gray;
}
</style>


<script>
export default {
    computed: {
        version() {
            return VERSION;
        },
        lang() {
            return this.$store.state.lang;
        },
        href() {
            return `//blog.webtor.io/${this.lang}/${this.version}/`;
        }
    }
}
</script>

