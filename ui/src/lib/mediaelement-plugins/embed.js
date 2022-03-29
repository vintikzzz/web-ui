import Settings from '../../components/App/Show/Player/MediaElement/Embed.vue';
import registry from '../registry';
Object.assign(MediaElementPlayer.prototype, {
    async buildembed(player, controls, layers) {
        // const store = this.options.store;
        // let {getters, dispatch} = store;
        player.embedButton = document.createElement('div');
        player.embedButton.className = `${this.options.classPrefix}button ${this.options.classPrefix}embed-button`;
        player.embedButton.innerHTML =
            `<button type="button" role="button" aria-owns="${this.id}" tabindex="0">&lt;<span class="slash">/</span>&gt;</button>`;
        this.addControlElement(player.embedButton, 'embed');
        player.embedLayer = document.createElement('div');
        player.embedLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}embed`;
        const embedContainer = document.createElement('div');
        player.embedLayer.appendChild(embedContainer);
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);
        // playLayer.style.display = 'none';

        layers.insertBefore(player.embedLayer, playLayer);
        player.embedLayer.style.width = '100%';
        player.embedLayer.style.height = '100%';
        let toggle = false;
        const t = () => {
            if (toggle) {
                player.embedLayer.style.display = 'none';
            } else {
                player.embedLayer.style.display = '';
            }
            toggle = !toggle;
        }
        registry.buildVue({
            el: embedContainer,
            render: (h) => h(Settings, {on: {
                close: t,
            }}),
        });
        player.embedLayer.style.display = 'none';
        player.embedLayer.style.zIndex = 2;
        player.embedButton.addEventListener('click', t);
    },
})