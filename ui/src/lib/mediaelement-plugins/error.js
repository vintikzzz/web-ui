import Error from '../../components/App/Show/Player/MediaElement/Error.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async builderror(player, controls, layers) {
        const store = this.options.store;
        player.errorLayer = document.createElement('div');
        player.errorLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}error`;
        const errorContainer = document.createElement('div');
        player.errorLayer.appendChild(errorContainer);
        player.errorLayer.style.width = '100%';
        player.errorLayer.style.height = '100%';
        player.errorLayer.style.display = 'none';
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);
        player.media.addEventListener('error', function(e) {
            player.errorLayer.style.display = '';
        });
        layers.insertBefore(player.errorLayer, playLayer);
        registry.buildVue({
            el: errorContainer,
            render: (h) => h(Error),
        });
    },
})