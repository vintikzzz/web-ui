Object.assign(MediaElementPlayer.prototype, {
    async builddownload(player, controls, layers) {
        const store = this.options.store;
        let {getters, dispatch} = store;
        player.downloadButton = document.createElement('div');
		player.downloadButton.className = `${this.options.classPrefix}button ${this.options.classPrefix}download-button`;
		player.downloadButton.innerHTML =
			`<button type="button" role="button" aria-owns="${this.id}" tabindex="0"></button>`;
		this.addControlElement(player.downloadButton, 'download');
        const t = (e) => {
            e.stopPropagation();
            e.preventDefault();
            dispatch('download', '/' + getters.filePath);
        }
        player.downloadButton.addEventListener('click', t);
    },
})