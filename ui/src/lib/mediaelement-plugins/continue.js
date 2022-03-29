import Continue from '../../components/App/Show/Player/MediaElement/Continue.vue';

import registry from '../registry';

Object.assign(MediaElementPlayer.prototype, {
    async buildcontinue(player, controls, layers) {
        const store = this.options.store;
        let {state, getters, dispatch} = store;
        if (state.time <= 60) {
            player.currentTime = 0;
            return;
        }
        const time = state.time; 
        const play = player.play;
        let lock = true;
        player.play = () => {
            if (!lock) {
                play.apply(player);
            }
        }
        player.pause();
        player.continueLayer = document.createElement('div');
        player.continueLayer.className = `${this.options.classPrefix}layer ${this.options.classPrefix}overlay ${this.options.classPrefix}continue`;
        const continueContainer = document.createElement('div');
        player.continueLayer.appendChild(continueContainer);
        const playLayer = layers.querySelector(`.${this.options.classPrefix}overlay-play`);

        layers.insertBefore(player.continueLayer, playLayer);
        // playLayer.style.display = 'none';
        // let toggle = false;
        function hideAndPlay() {
            lock = false;
            player.play();
            player.continueLayer.style.display = 'none';
        }
        function restartWatch() {
            if (!player) return;
            player.currentTime = 0;
            hideAndPlay();
        }
        function continueWatch() {
            player.currentTime = time - 5;
            hideAndPlay();
        }
        registry.buildVue({
            el: continueContainer,
            render: (h) => h(Continue, {
                on: {
                    continueWatch,
                    restartWatch,
                },
                props: {
                    time,
                },
            }),
        });
        player.continueLayer.style.zIndex = 2;
        playLayer.style.display = 'none';
    },
})