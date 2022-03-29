<template>
    <div class="container">
        <div class="overflow-auto">
            <div class="text-center">
                <b-button class="copy" variant="outline-light" @click="onCopy">{{ $t('common.copy hls') }}</b-button>
            </div>
        </div>
        <b-button class="back" variant="outline-light" @click="onBack">{{ $t('common.back') }}</b-button>
    </div>
</template>
<style lang="scss" scoped>
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
}
.save {
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
import {mapState} from 'vuex';
import clipboard from 'clipboard-js';
export default {
    computed: {
        ...mapState({
            url: (state) => state.playerSourceUrl,
        }),
    },
    methods: {
        async onCopy() {
            clipboard.copy(this.url);
            this.$emit('close');
        },
        onBack() {
            this.$emit('close');
        },
    },
}

</script>
