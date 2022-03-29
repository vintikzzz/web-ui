const state = () => ({
    audio: null,
    subtitle: null,
    error: null,
    availableDuration: 0,
    duration: 0,
    dropSubtitles: [],
});

const mutations = {
    setSubtitle(state, subtitle) {
        state.subtitle = subtitle;
    },
    setAudio(state, audio) {
        state.audio = audio;
    },
    setError(state, error) {
        state.error = error;
    },
    setAvailableDuration(state, d) {
        state.availableDuration = d;
    },
    setDuration(state, d) {
        state.duration = d;
    },
    dropSubtitles(state, d) {
        state.dropSubtitles = d;
    },
    clearSubtitleDrops(state) {
        state.dropSubtitles = [];
    },
};

const getters = {
    seeder: (state, getters, rootState, rootGetters)  => rootState.seeder,
    filePath: (state, getters, rootState, rootGetters)  => rootGetters.filePath,
};

const actions = {
    async dropSubtitles({commit}, s) {
        commit('dropSubtitles', s);
    },
    async clearSubtitleDrops({commit}) {
        commit('clearSubtitleDrops');
    },
    async setSubtitle({commit, dispatch}, s) {
        commit('setSubtitle', s);
        // await dispatch('updateSource', {}, {root: true});
        await dispatch('updateFileState', null, {root: true});
        await dispatch('updateCaption', {}, {root: true});
    },
    async setAudio({commit, dispatch}, a) {
        commit('setAudio', a);
        // await dispatch('updateSource', {}, {root: true});
        await dispatch('updateFileState', null, {root: true});
    },
    async updateAvailableDuration({commit, dispatch}, d) {
        commit('setAvailableDuration', d);
    },
    async updateDuration({commit}, d) {
        commit('setDuration', d);
    },
    async setError({dispatch, state, getters, commit}, e) {
        try {
            const err = await getters.seeder.error(getters.filePath);
            if (err) {
                let e = 'unknown error';
                if (err.includes('probing failed')) {
                    e = 'no peers for transcoding';
                } else if (err.includes('context deadline exceeded')) {
                    e = 'no peers for transcoding';
                } else {
                    e = err.split(': ').pop();
                }
                commit('setError', e);
            }
        } catch (e) {
            console.log(e);
            commit('setError', e.message);
        }
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