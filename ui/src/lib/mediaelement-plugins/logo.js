// import registry from '../registry';
Object.assign(MediaElementPlayer.prototype, {
    async buildlogo(player, controls, layers) {
        // const store = this.options.store;
        // let {getters, dispatch} = store;
        const route = this.options.route;
        const logoButton = document.createElement('div');
        logoButton.className = `${this.options.classPrefix}button ${this.options.classPrefix}logo-button`;
        logoButton.innerHTML =
            `<a title="Download at webtor.io" class="banner" target="_blank" href="/#${route.fullPath + '&event=player-logo-click'}"><span class="pre">download at</span><span class="text">webtor</span></a>`;
        player.container.appendChild(logoButton);
    },
})