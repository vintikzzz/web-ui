<template>
    <b-form-input
        :size="size"
        :placeholder="$t('common.paste magnet url')"
        v-model="magnetUrl"
        :state="magnetUrlState"
        @change="onMagnetChange" @paste="onMagnetPaste"
    />
</template>
<script>
import parseTorrent from 'parse-torrent';
export default {
    props: {
        size: {
            type: String,
            default: 'sm',
        },
    },
    data() {
        return {
            magnetUrl: '',
            magnetUrlState: null,
            updating: false,
        }
    },
    methods: {
        async onMagnetChange() {
            if (this.updating) return;
            this.updating = true;
            const {dispatch} = this.$store;
            try {
                this.magnetUrlState = null;
                this.$emit('change');
                await dispatch('fetchTorrent', this.magnetUrl);
                this.magnetUrl = '';
            } catch(e) {
                console.log(e);
                this.magnetUrlState = false;
            }
            this.updating = false;
        },
        onMagnetPaste(e) {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            this.magnetUrl = text;
            this.onMagnetChange();
            this.magnetUrl = '';
        },
    },
    activated() {
        this.magnetUrl = '';
        this.magnetUrlState = null;
    }
}
</script>