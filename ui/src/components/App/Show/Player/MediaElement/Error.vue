<template>
    <div v-if="error">{{ $t('errors.' + error.toLowerCase()) }}</div>
</template>

<script>
export default {
    computed: {
        error() {
            return this.$store.state.player.error;
        }
    },
}
</script>