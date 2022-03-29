import Preroll from '../../components/App/Show/Player/MediaElement/Preroll.vue';

import registry from '../registry';


Object.assign(MediaElementPlayer.prototype, {
    async buildpreroll(player, controls, layers) {
        player.prerollLayer = document.createElement('div');
        player.prerollLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}preroll`;
        const prerollContainer = document.createElement('div');
        player.prerollLayer.appendChild(prerollContainer);
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);

        layers.insertBefore(player.prerollLayer, playLayer);
        player.prerollLayer.style.width = '100%';
        player.prerollLayer.style.heigth = '100%';
        const play = player.play;
        let lock = true;
        player.play = () => {
            if (!lock) {
                play.apply(player);
            }
        }
        const close = () => {
            player.prerollLayer.style.display = 'none';
            lock = false;
            player.play();
            // player.controls.style.display = 'flex';
        }
        registry.buildVue({
            el: prerollContainer,
            render: (h) => h(Preroll, 
            {
                on: {
                    close,
                },
                props: {
                    autoplay: this.options.autoplay,
                },
            }),
        });
        player.prerollLayer.style.zIndex = 1000;
    },
})