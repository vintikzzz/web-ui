import Tracks from '../../components/App/Show/Player/MediaElement/Tracks.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async buildadvancedtracks(player, controls, layers) {
        player.tracksButton = document.createElement('div');
		player.tracksButton.className = `${this.options.classPrefix}button ${this.options.classPrefix}captions-button`;
		player.tracksButton.innerHTML =
			`<button type="button" role="button" aria-owns="${this.id}" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" id="mep_0-icon-captions" class="mejs__icon-captions" aria-hidden="true" focusable="false">
            <use xlink:href="assets/mejs-controls.svg#icon-captions"></use></svg></button>`;
		this.addControlElement(player.tracksButton, 'tracks');
        player.tracksLayer = document.createElement('div');
        player.tracksLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}tracks`;
        const tracksContainer = document.createElement('div');
        player.tracksLayer.appendChild(tracksContainer);
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);
        // playLayer.style.display = 'none';

        layers.insertBefore(player.tracksLayer, playLayer);
        player.tracksLayer.style.width = '100%';
        player.tracksLayer.style.height = '100%';
        let toggle = false;
        const t = () => {
            if (toggle) {
                player.tracksLayer.style.display = 'none';
            } else {
                player.tracksLayer.style.display = '';
            }
            toggle = !toggle;
        }
        const show = () => {
            player.tracksLayer.style.display = '';
            toggle = true;
        }
        const close = () => {
            player.tracksLayer.style.display = 'none';
            toggle = false;
        }
        const v = registry.buildVue({
            el: tracksContainer,
            render: (h) => h(Tracks, {
                props: {
                    player: player,
                },
                on: {
                    close,
                    show,
                }
            }),
        });
        player.tracksLayer.style.display = 'none';
        player.tracksLayer.style.zIndex = 2;
        player.tracksButton.addEventListener('click', t);

    },
})