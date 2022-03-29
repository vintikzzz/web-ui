import Browse from '../../components/App/Show/Player/MediaElement/Browse.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async buildbrowse(player, controls, layers) {
        const store = this.options.store;
        let {state, getters, dispatch} = store;
        if (getters.currentVideoFiles.length < 2) return;
        player.browseLayer = document.createElement('div');
        player.browseLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}browse`;
        const browseContainer = document.createElement('div');
        player.browseLayer.appendChild(browseContainer);
        player.browseLayer.style.width  = '100%';
        player.browseLayer.style.height = '100%';
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);

        layers.insertBefore(player.browseLayer, playLayer);
        registry.buildVue({
            el: browseContainer,
            render: (h) => h(Browse, {on: {
                hide() {
                    player.browseLayer.style.display = 'none';
                },
                show() {
                    player.browseLayer.style.display = '';
                },
            }}),
        });
        player.browseLayer.style.zIndex = 2;
        player.browseLayer.addEventListener('click', function() {
            player.play();
            player.browseLayer.style.display = 'none';
        });
    },
})