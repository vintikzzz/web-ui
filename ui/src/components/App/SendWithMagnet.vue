<template>
    <b-input-group class="send-with-magnet large inverse">
        <icon class="magnet" name="magnet"></icon>
        <magnet class="magnet-input" size="lg" />
        <b-input-group-append>
            <send drop-right no-magnet />
        </b-input-group-append>
    </b-input-group>
</template>

<script>
import Magnet from './Send/Magnet.vue';
import Send from './Send.vue';
export default {
    components: {Magnet, Send},
}
</script>

<style lang="scss">
  .send-with-magnet {
    input {
        padding-left: 2.5rem !important;
    }
    .magnet-input {
        border-top-left-radius: 0.3rem !important;
        border-bottom-left-radius: 0.3rem !important;
    }
    .input-group-append .send-file {
        border-radius: 0rem;
    }
  }
</style>

<style lang="scss" scoped>
@import "ui/src/scss/dark_variables";

.magnet {
  position: absolute;
  left: 0.74rem;
  top: 0.9rem;
  z-index: 100;
  width: 20px;
  height: 20px;
  color: $body-color;
}
</style>