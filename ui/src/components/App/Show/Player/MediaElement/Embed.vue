<template>
    <div class="container">
        <b-form-textarea rows="3" readonly ref="input" :value="snippet" @click="select"></b-form-textarea>
        <div class="ref text-center" v-html="$tm('common.player sdk')" />
        <b-button class="copy" variant="outline-light" @click="onCopy">{{ $t('common.copy') }}</b-button>
        <b-button class="back" variant="outline-light" @click="onBack">{{ $t('common.back') }}</b-button>
    </div>
</template>
<style lang="scss" scoped>
.ref {
    margin-top: 0.5rem;
    font-size: 0.8rem;
}
textarea {
    overflow-y: hidden !important;
    resize: none;
    height: calc(100% - 2rem);
}
.overflow-auto {
    height: calc(100% - 50px);
    overflow-y: scroll;
}
.container {
    width: 80%;
    height: 80%;
    background: black;
    color: white;
    opacity: 0.9;
    padding: 1rem;
    position: relative;
    padding-bottom: 4rem;
}
.copy {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
}
.back {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
}
</style>
<script>
import clipboard from 'clipboard-js';
export default {

    computed: {
        snippet() {
            return `<video controls src="${this.$store.getters.magnetURI}" data-path="${this.$store.getters.filePath}"><\/video>\n` + 
                   `<script src="https://cdn.jsdelivr.net/npm/@webtor/player-sdk-js/dist/index.min.js" charset="utf-8" async><\/script>`;
        }
    },
    methods: {
        async onCopy() {
            clipboard.copy(this.snippet);
            this.$emit('close');
        },
        onBack() {
            this.$emit('close');
        },
        select() {
            this.$refs['input'].$el.select();
        },
    },
}

</script>
