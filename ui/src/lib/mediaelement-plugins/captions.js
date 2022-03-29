import Captions from '../../components/App/Show/Player/MediaElement/Tracks/Captions.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async buildcaptions(player, controls, layers) {
		player.captionsLayer = document.createElement('div');
		player.captionsLayer.className = `${this.options.classPrefix}captions-layer ${this.options.classPrefix}layer`;
        const captionsContainer = document.createElement('div');
        player.captionsLayer.appendChild(captionsContainer);
		layers.insertBefore(player.captionsLayer, layers.firstChild);
        player.captionsLayer.style.width = '100%';
        player.captionsLayer.style.height = '100%';
        player.captionsLayer.addEventListener('click', function() {
            player.pause();
        });
        registry.buildVue({
            el: captionsContainer,
            render: (h) => h(Captions),
        });
    },
})