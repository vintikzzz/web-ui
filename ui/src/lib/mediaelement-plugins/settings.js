import Settings from '../../components/App/Show/Player/MediaElement/Settings.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async buildsettings(player, controls, layers) {
        const store = this.options.store;
        let {state, getters, dispatch} = store;
        // if (getters.deliveryType !== 'webseed') {
        //     await dispatch('getMediaInfo');
        // }
        player.settingsButton = document.createElement('div');
		player.settingsButton.className = `${this.options.classPrefix}button ${this.options.classPrefix}settings-button`;
		player.settingsButton.innerHTML =
			`<button type="button" role="button" aria-owns="${this.id}" tabindex="0"></button>`;
		this.addControlElement(player.settingsButton, 'settings');
        player.settingsLayer = document.createElement('div');
        player.settingsLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}settings`;
        const settingsContainer = document.createElement('div');
        player.settingsLayer.appendChild(settingsContainer);
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);
        // playLayer.style.display = 'none';

        layers.insertBefore(player.settingsLayer, playLayer);
        player.settingsLayer.style.width = '100%';
        player.settingsLayer.style.height = '100%';
        // player.settingsLayer.click = function(e) {
        //     console.log(e);
        //     e.preventDefault();
        //     return false;
        // }
        let toggle = false;
        const t = () => {
            if (toggle) {
                player.settingsLayer.style.display = 'none';
            } else {
                player.settingsLayer.style.display = '';
            }
            toggle = !toggle;
        }
        registry.buildVue({
            el: settingsContainer,
            render: (h) => h(Settings, {on: {
                close: t,
            }}),
        });
        player.settingsLayer.style.display = 'none';
        player.settingsLayer.style.zIndex = 2;
        player.settingsButton.addEventListener('click', t);
    },
})