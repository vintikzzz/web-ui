<template>
    <div class="buttons">
        <b-button v-if="hasPrev" class="play-prev" variant="outline-light" @click="onPrev">← {{ $t('common.previous') }}</b-button>
        <item
        v-for="(item, index) in pageItems"
            :item="item"
            :index="index"
            :key="item.name"
        ></item>
        <b-button v-if="hasNext" class="play-next" variant="outline-light" @click="onNext">{{ $t('common.next') }} →</b-button>
    </div>
</template>
<style lang="scss" scoped>
    button {
        margin: 0.5rem;
    }
    .buttons {
        text-align: center;
        background: black;
        color: white;
        opacity: 0.9;
        padding: 1rem;
        position: absolute;
        top: 70%;
        left: 50%;
        width: 80%;
        transform: translateX(-50%) translateY(-50%);
    }
</style>

<script>
import Item from './List/Item.vue';
export default {
    components: {Item},
    data() {
        return {
            pageNum: 1,
            pageSize: 4,
        };
    },
    computed: {
        items() {
            return this.$store.getters.currentVideoFilesWithFriendlyNames;
        },
        pageItems() {
            const res = [];
            let last = this.pageNum * this.pageSize + 1;
            if (this.pageNum * this.pageSize + 1 >= this.items.length - 1) {
                last = this.items.length;
            }
            if (this.pageNum == 1) {
                for (let i = 0; i < last; i++) {
                    res.push(this.items[i]);
                }
            } else {
                // if (this.pageNum * pageSize +  >= this.items.length) {
                //     last = this.items.length - 1;
                // }
                for (let i = (this.pageNum - 1) * this.pageSize + 1; i < last; i++) {
                    res.push(this.items[i]);
                }
            }
            return res;
        },
        hasPrev() {
            return this.pageNum != 1;
        },
        hasNext() {
            return this.pageNum * this.pageSize + 1 < this.items.length - 1;
        }
    },
    methods: {
        onNext() {
            this.pageNum++;
        },
        onPrev() {
            this.pageNum--;
        },
    },
};
</script>