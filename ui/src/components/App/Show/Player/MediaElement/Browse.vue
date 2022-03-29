<template>
    <div class="container">
        <div @click.prevent.stop class="current">
            <keep-alive>
                <component v-bind:is="current" @list="onList"></component>
            </keep-alive>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .container {
        width: 100%;
        height: 100%;
        cursor: pointer;
        overflow: hidden;
        position: relative;
    }
</style>
<script>
import PrevNext from './Browse/PrevNext.vue';
import List from './Browse/List.vue';
import {PAUSE} from '../../../../../lib/store/playerStatusTypes';
import {mapState, mapGetters} from 'vuex';
export default {
    components: {PrevNext, List},
    data() {
        return {
            current: 'PrevNext',
        };
    },
    computed: {
        ...mapState({
            status: (state) => state.playerStatus,
        }),
    },
    methods: {
        onList() {
            this.current = 'List';
        },
    },
    watch: {
        status(a, b) {
            if (this.status == PAUSE) {
                this.$emit('show');
            } else {
                this.current = 'PrevNext';
                this.$emit('hide');
            }
        },
    },
}

</script>
