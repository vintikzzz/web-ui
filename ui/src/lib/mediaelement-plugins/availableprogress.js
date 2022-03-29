import AvailabeProgress from '../../components/App/Show/Player/MediaElement/AvailabeProgress.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async buildavailableprogress(player, controls, layers) {
        const store = this.options.store;
        const slider = player.slider;
        const el = document.createElement('span');
        // el.className = `${this.options.classPrefix}time-available`;
        slider.appendChild(el);
        // player.errorLayer = document.createElement('div');
        // player.errorLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}error`;
        // const errorContainer = document.createElement('div');
        // player.errorLayer.appendChild(errorContainer);
        // player.errorLayer.style.width = '100%';
        // player.errorLayer.style.height = '100%';
        // player.errorLayer.style.display = 'none';
        // const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);
        // player.media.addEventListener('error', function(e) {
        //     player.errorLayer.style.display = '';
        // });
        // layers.insertBefore(player.errorLayer, playLayer);
        const self = this;
        registry.buildVue({
            el,
            render: (h) => h(AvailabeProgress, {
                props: {
                    options: self.options,
                }
            }),
        });
    },
})