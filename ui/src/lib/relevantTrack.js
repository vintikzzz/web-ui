function normalizeLang(lang) {
    return lang.split('_')[0].toLowerCase();
}
function getRelevantTrackFromTracks(lang, tracks) {
    lang = normalizeLang(lang);
    for (const t of tracks) {
        if (normalizeLang(t.srclang) == lang) {
            return t;
        }
    }
    return null;
}
async function getRelevantTrackForLang({state, getters}, lang) {
    let track = null;
    track = getRelevantTrackFromTracks(lang, state.attachedTracks);
    if (track) {
        track.source = 'attached';
    }
    if (!track) {
        const tracks = await getters.openSubtitlesTracks;
        if (tracks) {
            track = getRelevantTrackFromTracks(lang, tracks);
            if (track) {
                track.source = 'openSubtitles';
            }
        }
    }
    return track;
}
export default async function getRelevantTrack(store) {
    const {state} = store;
    let track = null;
    track = await getRelevantTrackForLang(store, state.userLang);
    if (!track) {
        track = await getRelevantTrackForLang(store, state.fallbackLang);
    }
    return track;
}