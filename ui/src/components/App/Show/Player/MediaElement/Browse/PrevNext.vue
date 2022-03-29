<template>
    <div class="buttons">
        <b-button v-if="hasPrev" class="play-prev" variant="outline-light" @click="onPrev">← {{ $t('common.previous') }}</b-button>
        <b-button v-if="hasBrowse" class="browse" variant="outline-light" @click="onBrowse">{{ $t('common.browse') }}</b-button>
        <b-button v-if="hasNext" class="play-next" variant="outline-light" @click="onNext">{{ $t('common.next') }} →</b-button>
    </div>
</template>
<style lang="scss" scoped>
    .buttons {
        background: black;
        color: white;
        opacity: 0.9;
        padding: 1rem;
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
    }
</style>
<script>
import {mapState, mapGetters} from 'vuex';
export default {
    computed: {
        ...mapState([
            'file',
        ]),
        ...mapGetters([
            'currentVideoFiles',
        ]),
        hasBrowse() {
            return this.currentVideoFiles.length > 1;
        },
        hasPrev() {
            return this.currentVideoFiles.indexOf(this.file) != 0;
        },
        hasNext() {
            return this.currentVideoFiles.indexOf(this.file) != this.currentVideoFiles.length - 1;
        },
    },
    methods: {
        onNext(e) {
            const i = this.currentVideoFiles.indexOf(this.file);
            const next = this.currentVideoFiles[i+1];
            this.$store.dispatch('open', next);
        },
        onPrev(e) {
            const i = this.currentVideoFiles.indexOf(this.file);
            const prev = this.currentVideoFiles[i-1];
            this.$store.dispatch('open', prev);
        },
        onBrowse(e) {
            this.$emit('list');
        },
    },
}
</script>
