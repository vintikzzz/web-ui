<template>
    <span :class="className">
        <span class="container">
            <span class="resizer" :style="style">
                <span v-html="caption" />
            </span>
        </span>
    </span>
</template>

<script>
import {sanitize} from '../../../../../../lib/store/caption';
export default {
    computed: {
        style() {
            const cs = this.$store.state.captionSize;
            return {
                'font-size': 100 + cs * 10 + '%',
                // 'line-height': 100 + cs * 10 + '%',
            };
        },
        className() {
            let c = 'caption';
            if (this.$store.state.playerControlsShown) {
                c += ' caption-with-controls';
            }
            if (this.$store.state.playerFullScreen) {
                c += ' caption-fullscreen';
            }
            return c;
        },
        caption() {
            const c = this.$store.state.caption;
            if (!c) return;
            const text = sanitize(c.text);
            let chunks = text.split(/(?:\r\n|\r|\n)/g);
            chunks = chunks.map(c => '<span class="chunk">' + c + '</span>');
            return chunks.join('<br />');
        }
    },
}
</script>

<style lang="scss">
.caption {
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    position: absolute;
}
.caption .container {
    font-size: 1.3rem;
    line-height: normal;
    padding-left: 0px;
    // line-height: 1.8rem;
}
.caption .container .chunk {
    background-color:rgba(0, 0, 0, 0.8);
    padding: 0.1rem 0.5rem;
    white-space: nowrap;
    display: inline-block;
}
.caption.caption-fullscreen .container {
    font-size: 2.3vh;
    // line-height: 2.8vh;
    padding: 0.2vh 0.5vh;
}
.caption.caption-fullscreen {
    bottom: 3.5vh;
}
@media (max-width: 768px) {
    .caption .container {
        font-size: 1rem;
        // line-height: 1.4rem;
    }
}

</style>