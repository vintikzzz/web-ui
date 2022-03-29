<template>
    <b-form inline>
        <label class="mr-sm-2">{{ $t('common.size') }}:</label>
        <b-input class="mb-2 mr-sm-2 mb-sm-0 caption-size" v-model="size" readonly disabled></b-input>
        <b-button-group>
            <b-button variant="outline-light" @click="smaller">&ndash;</b-button>
            <b-button variant="outline-light" @click="bigger">+</b-button>
        </b-button-group>
    </b-form>
</template>

<script>
export default {
    computed: {
        size() {
            return this.$store.state.captionSize;
        },
    },
    methods: {
        bigger() {
            this.$store.dispatch('changeCaptionSize', 1);
        },
        smaller() {
            this.$store.dispatch('changeCaptionSize', -1);
        },
    },
}
</script>

<style lang="scss" scoped>
input.caption-size {
    width: 2.8rem !important;
    text-align: center;
}

</style>