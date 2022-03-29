<template>
    <div>
        <a v-if="!user" :href="authURL">{{ $tm('common.sponsor login') }}</a>
        <span class="greeting" v-if="user" :href="authURL">{{ $tm('common.greeting') }}, {{ user.firstName || 'Anonumous' }}! 🎉🎉🎉</span>
        <a v-if="user" :href="authURL">{{ $tm('common.not you') }}</a>
    </div>
</template>

<style lang="scss" scoped>
.light .jumbotron a {
    color: white;
}
.greeting {
    margin-right: 0.5rem;
}
</style>

<script>
export default {
    computed: {
        authURL() {
            return this.$store.state.authURL;
        },
        user() {
            return this.$store.state.user;
        },
    },
}
</script>