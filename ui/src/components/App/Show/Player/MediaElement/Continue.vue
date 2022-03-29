<template>
    <div class="container">
        <b-button class="continue" variant="outline-light" @click="onContinue">{{ $t('common.continueFrom') }} {{ time.toString().toHHMMSS() }}</b-button>
        <b-button class="restart" variant="outline-light" @click="onRestart">{{ $t('common.restart') }}</b-button>
    </div>
</template>
<style lang="scss" scoped>
.container {
    width: 80%;
    background: black;
    color: white;
    opacity: 0.9;
    padding: 1rem;
    position: relative;
    height: 120px;
}
button {
    display: block;
    width: 100%;
    margin-bottom: 10px;
}
</style>
<script>
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours + ':' + minutes + ':' + seconds;
}
import {mapState} from 'vuex';
export default {
    props:{
      time: Number,
    },
    methods: {
        onContinue() {
            this.$emit('continueWatch');
        },
        onRestart() {
            this.$emit('restartWatch');
        },
    },
}

</script>
