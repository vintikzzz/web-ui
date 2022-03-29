<template>
    <a @click.prevent.stop="" v-b-modal.magnet-uri-modal class="btn magnet-uri my-btn-link" :href="magnetURI">
        <span class="icon-wrapper"><icon name="magnet"></icon></span>{{ $tm('common.magnet uri') }}
        <b-modal id="magnet-uri-modal" centered no-fade :title="$tm('common.magnet uri')">
            <b-form-textarea rows="3" max-rows="15" readonly :value="magnetURI" ref="input"></b-form-textarea>
            <template #modal-footer="{ ok }">
                <b-button variant="primary" @click="copyUrl(); ok()">{{ $tm('common.copy link') }}</b-button>
            </template>
        </b-modal>
    </a>
</template>

<style lang="scss">

#magnet-uri-modal {
    .modal-dialog {
        max-width: 650px !important;
        // width: 650px !important;
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
textarea {
    overflow-y: hidden !important;
    resize: none;
}
</style>

<script>
import * as clipboard from 'clipboard-polyfill';
import 'vue-awesome/icons/magnet';
export default {
    computed: {
        magnetURI() {
            return this.$store.getters.magnetURI;
        }
    },
    methods: {
        copyUrl() {
            clipboard.writeText(this.magnetURI);
        },
  },
}
</script>