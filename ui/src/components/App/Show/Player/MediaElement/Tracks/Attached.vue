<template>
    <div>
        <subtitles />
        <audio-tracks />
    </div>
</template>
<script>
import Subtitles from './Attached/Subtitles.vue';
import AudioTracks from './Attached/AudioTracks.vue';
export default {
  components: { Subtitles, AudioTracks },
}
</script>
