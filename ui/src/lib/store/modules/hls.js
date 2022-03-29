function prepareTrack(d) {
    return {
        autoselect: d.autoselect,
        default: d.default,
        forced: d.forced,
        srclang: d.lang,
        label: d.name,
        src: d.url,
        id: d.id,
    };
}

const state = () => ({
    audio: [],
    subtitles: [],
});

const mutations = {
    setSubtitles(state, subtitles) {
        state.subtitles = subtitles;
    },
    setAudio(state, audio) {
        state.audio = audio;
    },
};

const getters = {};

const actions = {
    async updateSubtitles({ commit, dispatch }, subs) {
        const r = [];
        for (const s of subs) {
            r.push(prepareTrack(s));
        }
        commit('setSubtitles', r);
        dispatch('updateAttachedTracks', {}, {root: true});
    },
    async updateAudio({ commit }, audio) {
        const r = [];
        for (const a of audio) {
            r.push(prepareTrack(a));
        }
        commit('setAudio', r);
    },
};

export default {
    namespaced: true,
    strict: true,
    state,
    getters,
    actions,
    mutations
};