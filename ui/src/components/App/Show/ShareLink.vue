<template>
    <a @click.prevent.stop="" v-b-modal.share-link-modal class="btn share-link my-btn-link" :href="shareLink">
        <span class="icon-wrapper"><icon name="share"></icon></span>{{ $tm('common.share link') }}
        <b-modal id="share-link-modal" centered no-fade :title="$tm('common.share link')">
            <b-input readonly :value="shareLink" ref="input"></b-input>
            <template #modal-footer="{ ok }">
                <b-button variant="primary" @click="copyUrl(); ok()">{{ $tm('common.copy link') }}</b-button>
            </template>
        </b-modal>
    </a>
</template>

<style lang="scss">
#share-link-modal {
    .modal-dialog {
        max-width: 560px !important;
        // width: 560px !important;
    }
}
.btn {
    white-space: nowrap;
}

</style>

<style lang="scss" scoped>
.icon-wrapper {
    padding-right: 0.3rem;
    display: inline-block;
    position: relative;
    top: -0.05rem;
    left: -0.15rem;
}
</style>
<script>
import * as clipboard from 'clipboard-polyfill';
import 'vue-awesome/icons/share';
export default {
    computed: {
        shareLink() {
            return this.$store.getters.shareLink;
        }
    },
    methods: {
        copyUrl() {
            clipboard.writeText(this.shareLink);
        },
        // select() {
        //     this.$refs['input'].$el.select();
        // }
  },
}
</script>