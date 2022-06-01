import {SET_TORRENT_SUCCESS, SET_PWD_SUCCESS,
        SET_FILE_SUCCESS, SET_SOURCE, SET_PLAYER_STATUS_SUCCESS,
        SET_TORRENT_FAILURE,
        SET_STAT_SUCCESS,
        SET_LOAD_STATE, SET_LOAD_STATE_SUCCESS,
        SET_LOAD_STATE_FAILURE,
        SET_LANG, SET_ABUSED, SET_MEDIA_INFO,
        SET_PLAYER_TIME, SET_CURRENT_DIR_FILE_STATES, SET_FILE_STATE,
        SET_RECENT_TORRENTS, SET_RECENT_TORRENT,
        SET_ADBLOCK_ENABLED, SET_VIEW_MODE,
        SET_EXTERNAL_SUBTITLES, SET_EXTERNAL_POSTER, SET_AUTOPLAY, SET_CAPTION, 
        SET_HEADER, SET_EXTERNAL_TITLE, SET_HEIGHT, SET_WIDTH, SET_IMDBID,
        SET_COMPLETED_PIECES, CHANGE_CAPTION_SIZE, SET_USER_SETTINGS, 
        SET_ADS_INJECTED, SET_EXTERNAL_FEATURES,
        SET_NEW_POSITION, SET_SEEDER, SET_ZIP_DOWNLOAD,
        SET_ATTACHED_TRACKS, SET_LAST_TIME, SET_FIRST_PLAY, SET_IS_CACHED, SET_EXTERNAL_CONTROLS,
        SET_DOWNLOAD_PATH, SET_DOWNLOAD_STAT, DROP_DOWNLOAD_STAT, SET_DOWNLOAD_TYPE,
        UPDATE_WINDOW_WIDTH, SET_INITED, SET_PROGRESS, SET_USER_LANG, SET_API_UNREACHABLE,
       } from './mutationTypes';
import {PLAYING, PAUSE} from './playerStatusTypes';
import {VIDEO, DOWNLOAD} from './viewModeTypes';
import {clean, cleanPlayerTrack, cleanState, randomId, processSubtitles} from './helpers';
import parseTorrent from 'parse-torrent';
import omitEmpty from 'omit-empty';
import fileToTorrent from './fileToTorrent';
import {getLangRoute} from './../langRoutes';
import getRelevantTrack from './../relevantTrack';
import stoplistCheck from '../stoplistCheck';
import stringToTorrent from './stringToTorrent';
const debug = require('debug')('webtor:lib:store');
const md5 = require('md5');
const Url = require('url-parse');
const cloneDeep = require('clone-deep');
const loadScript = require('load-script2');
import dot from 'dot-object';
import arrayToText from './arrayToText';
import Vue from 'vue';
import state from './state';
let logTimePeriod = 15;
let statsClient;
let adsenseInited = false;
let adScriptsInited = false;
import debounce from 'lodash/debounce';
const sha1 = require('sha1');
export default function({router, message, db, sdk, ext, i18n, injectHash, injectCode, config}) {
    return {
        log({}, message) {
            debug(message);
        },
        adblockEnabled: ({ commit }) => {
            // event('Show', 'ADBLOCK_ENABLED');
            commit(SET_ADBLOCK_ENABLED);
        },
        changeCaptionSize: ({ commit, dispatch }, val) => {
            commit(CHANGE_CAPTION_SIZE, val);
            dispatch('updateUserSettings');
        },
        getMediaInfo: async ({ commit, state, getters }) => {
            if (getters.deliveryType == 'webseed') return;
            const md = clean(getters.metadata);
            md.invoke = false;
            const data = await state.seeder.mediaInfo(getters.filePath, md);
            commit(SET_MEDIA_INFO, data);
        },
        async play({ commit, dispatch }) {
            dispatch('stats');
            commit(SET_PLAYER_STATUS_SUCCESS, PLAYING);
        },
        async pause({ commit }) {
            commit(SET_PLAYER_STATUS_SUCCESS, PAUSE);
        },
        async cd({ dispatch, state }, pwd) {
            if (pwd == state.pwd) return;
            dispatch('log', `Change directory path=${pwd}`)
            // event('Show', 'CD', pwd);
            await dispatch('setState', {
                torrent: state.torrent,
                pwd,
            });
            await dispatch('pushState');
        },
        async getCurrentDirFileStates({ commit, state }) {
            const states = await db.getCurrentDirFileStates({
                infoHash: state.torrent.infoHash,
                pwd: state.pwd,
            });
            const statesObj = {};
            for (const s of states) {
                statesObj[s.file] = s;
            }
            commit(SET_CURRENT_DIR_FILE_STATES, statesObj);
        },
        async open({ dispatch, state, commit }, file) {
            dispatch('log', `Open path file=${file}`)
            await dispatch('setState', {
                torrent: state.torrent,
                pwd: state.pwd,
                file,
                autoplay: true,
            });

            await dispatch('pushState');
        },
        async hideDownload({commit}) {
            commit(SET_DOWNLOAD_TYPE, null);
            commit(SET_DOWNLOAD_PATH, null);
        },
        async download({ dispatch, state, getters, commit }, path) {
            commit(SET_DOWNLOAD_TYPE, 'file');
            commit(SET_DOWNLOAD_PATH, path);
        },
        async downloadUrl({ state, getters }) {
            let url = null;
            if (state.downloadType == 'zip') {
                url = await state.seeder.zipUrl(state.downloadPath, clean(getters.metadata));
            } else {
                url = await state.seeder.downloadUrl(state.downloadPath, clean(getters.metadata));
            }
            return url;
        },
        async proceedTorrentDownload({ dispatch, state, getters, commit }) {
            const torrent = cloneDeep(state.torrent);
            const buf = parseTorrent.toTorrentFile(torrent);
            // https://stackoverflow.com/a/9834261
            const blob = new Blob([buf.buffer]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = torrent.name + '.torrent';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        },
        async proceedDownload({ dispatch, state, getters, commit }) {
            let onMessage = (p, m) => {
                commit(SET_DOWNLOAD_STAT, {p: p, m});
            };
            let onEnd = (p, res) => {
                // setTimeout(() => {
                //     commit(DROP_DOWNLOAD_STAT, p);
                // }, 10000);
            };
            let url = null;
            if (state.downloadType == 'zip') {
                url = await state.seeder.zipUrlWithProgress(state.downloadPath, onMessage, onEnd, clean(getters.metadata));
                dispatch('downloadEvent', 'Content Zip Download');
            } else {
                url = await state.seeder.downloadUrlWithProgress(state.downloadPath, onMessage, onEnd, clean(getters.metadata));
                dispatch('downloadEvent', 'Content Download');
            }
            dispatch('log', `Download path=${state.downloadPath} type=${state.downloadType} url=${url.href}`)
            dispatch('stats');
            window.location = url.href;
        },
        event({ getters }, { name, payload = {} }) {
            const data = Object.assign({}, getters.gtagDimensions, payload);
            if (Vue.$gtag !== undefined) Vue.$gtag.event(name, data);
        },
        downloadEvent({ getters }, name) {
            const data = Object.assign({}, getters.gtagDownloadDimensions, { 'dimension10': state.downloadPath });
            if (Vue.$gtag !== undefined) Vue.$gtag.event(name, data);
        },
        async zip({ dispatch, state, getters, commit }) {
            if (!state.torrent) return;
            let path = state.pwd;
            if (path == '/') {
                path = '/' + state.torrent.name;
            }
            debug('zip invoked path=%o', path);
            commit(SET_DOWNLOAD_TYPE, 'zip');
            commit(SET_DOWNLOAD_PATH, path);
        },
        async delivery({ commit, state, getters, dispatch }) {
            if (!state.torrent || !state.file) return;
            const filePath = getters.filePath;
            const src = await state.seeder.streamUrl(filePath, clean(getters.metadata));
            dispatch('log', `Deliver content file=${filePath} url=${src}`)
            dispatch('updateSource');
            dispatch('stats');
        },
        async stats({ state, getters, commit }) {
            const filePath = getters.filePath;
            const isCached = await state.seeder.isCached(filePath, clean(getters.metadata));
            commit(SET_IS_CACHED, isCached);
            if (state.features.p2pProgress && !isCached && !statsClient) {
                try {
                    statsClient = state.seeder.stats('', (path, data) => {
                        // var t0 = performance.now()
                        commit(SET_STAT_SUCCESS, data);
                        // var t1 = performance.now()
                        // console.log(`Call to SET_STAT_SUCCESS took ${(t1 - t0)} milliseconds count ${data.length}.`)
                    }, clean(getters.metadata));
                } catch (e) {
                    debug(e);
                    statsClient = null;
                }
            }
        },
        async pushTorrent({ getters, dispatch }, torrent) {
            const expire = 60 * 60 * 24 * 30; // 1 month
            dispatch('log', `Push torrent torrentInfo=${torrent.infoHash}`)
            try {
                return await sdk.torrent.touch(torrent, expire, clean(getters.metadata));
            } catch (e) {
                if (e == 'not found') {
                    try {
                        return await sdk.torrent.push(torrent, expire, clean(getters.metadata));
                    } catch (e) {
                        debug(e);
                        throw e;
                    }
                } else {
                    debug(e);
                    throw e;
                }
            }
        },
        async pushAbuse({ getters }, abuse) {
            return await sdk.abuse.push(abuse, clean(getters.metadata));
        },
        async setState({ commit, state, dispatch, getters }, newState) {
            let { torrent, file, pwd, autoplay } = newState;
            if (!pwd && torrent && torrent.files.length > 0) {
                const pieces = torrent.files[0].path.split('/');
                if (pieces.length > 1) {
                    pwd = '/' + pieces[0];
                }
            }
            if (!pwd) pwd = '/';
            const oldState = {
                torrent: state.torrent,
                file: state.file,
                pwd: state.pwd,
            };
            if (JSON.stringify(cleanState(oldState)) ==
                JSON.stringify(cleanState(newState))) return;
            await dispatch('leave');
            // const downloadID = randomId((torrent ? torrent.infoHash : '') + pwd + file);
            if ((torrent && !state.torrent) || (torrent && torrent.infoHash != state.torrent.infoHash)) {
                await db.pushTorrent(torrent);
            }
            commit(SET_TORRENT_SUCCESS, torrent);
            commit(SET_PWD_SUCCESS, pwd);
            commit(SET_FILE_SUCCESS, file);
            // commit(SET_DOWNLOAD_ID, downloadID);
            // commit(SET_AUTOPLAY, oldState.torrent != null);
            if (torrent && !file && (oldState.torrent == null || oldState.torrent.infoHash != torrent.infoHash)) {
                const videos = getters.currentPrimaryVideoFiles;
                if (videos.length > 0) {
                    file = videos[0];
                    commit(SET_FILE_SUCCESS, file);
                }
            }
            if (torrent && pwd) {
                const data = await db.setRecentTorrent(torrent, pwd);
                commit(SET_RECENT_TORRENT, data);

                await dispatch('getCurrentDirFileStates');
            }
            if (torrent && pwd && file) {
                if (getters.isDownloadMode) {
                    await dispatch('zip');
                } else {
                    const userData = await db.getFileState({ infoHash: torrent.infoHash, pwd, file });
                    let time = 0;
                    let track = null;
                    const tracks = await getters.tracks;
                    if (tracks.length > 0) {
                        for (const t of tracks) {
                            if (t.autoselect) {
                                track = t;
                                break;
                            }
                        }
                    }
                    if (userData && userData.time) time = userData.time;
                    if (userData && userData.subtitle && userData.subtitle.src) {
                        track = userData.subtitle;
                        let u = new Url(track.src);
                        const search = {};
                        if (state.imdbId) {
                            search['imdb-id'] = state.imdbId;
                        }
                        const query = await sdk.util.makeQuery(Object.assign(clean(getters.metadata), search));
                        u.set('query', query);
                        track.src = u;
                    }
                    if (track && track.type == 'ext') {
                        let found = false;
                        for (const t of tracks) {
                            if (t.hash == track.hash) {
                                found = true;
                            }
                        }
                        if (!found) track = null;
                    }
                    await dispatch('player/setSubtitle', track);
                    let audio = null;
                    if (userData && userData.audio && userData.audio.src) {
                        audio = userData.audio;
                        let u = new Url(track.src);
                        const query = await sdk.util.makeQuery(Object.assign(clean(getters.metadata), {}));
                        u.set('query', query);
                        audio.src = u;
                    }
                    await dispatch('player/setAudio', audio);
                    commit(SET_AUTOPLAY, autoplay);
                    commit(SET_PLAYER_TIME, time);
                    dispatch('event', { name: 'Content Show' });
                    await dispatch('delivery');
                }
            }
        },
        async fetchMagnet({ dispatch, getters }, magnet) {
            let torrent = null;
            dispatch('log', `Fetch torrent magnet=${magnet}`)
            var { _, infoHash } = parseTorrent(magnet);
            dispatch('log', `Fetching from localdb`)
            torrent = await db.pullTorrent(infoHash);
            if (!torrent || !torrent.pieces || torrent.pieces.length == 0) {
                try {
                    dispatch('log', `Fetching from torrent store`)
                    torrent = await sdk.torrent.pull(infoHash, clean(getters.metadata));
                } catch (e) {
                    debug(e);
                }
            }
            if (!torrent) {
                dispatch('log', `Fetching by magnet uri from peers`)
                // event('Show', 'MAGNET_FETCHING', magnet);
                torrent = await sdk.magnet.fetchTorrent(magnet, clean(getters.metadata));
                // event('Show', 'MAGNET_FETCHED', magnet);
            }
            return torrent;
        },
        async fetchFromURL({ }, url) {
            if (url.match(/^http/)) {
                url = await sdk.ext.url(url);
            }
            return await sdk.torrent.fromUrl(url);
        },
        async processInit({ commit, getters, dispatch }, init) {
            commit(SET_ADS_INJECTED, true);
            message.send('inject', injectCode);
            const check = await message.receiveOnce('check');
            await loadScript('/sandblaster.min.js');
            const sb = sandblaster.detect();
            debug('chacking hashes %o %o', sha1(check), injectHash);
            if ((sha1(check) != injectHash) || sb.sandboxed) {
                router.push({ name: 'empty' }).catch(() => {});
                message.send('forbidden');
                return false;
            }
            loadScript('/iframeResizer.contentWindow.min.js');
            // if (getters.isIndia && !getters.isSponsor) {
            //     router.push({ name: 'empty' }).catch(() => {});
            //     message.send('forbidden');
            //     return
            // }
            if (init.imdbId) {
                commit(SET_IMDBID, init.imdbId);
            }
            if (init.subtitles) {
                commit(SET_EXTERNAL_SUBTITLES, init.subtitles);
                dispatch('updateAttachedTracks');
            }
            if (init.hasOwnProperty('controls')) {
                commit(SET_EXTERNAL_CONTROLS, init.controls);
            }
            if (init.features) {
                commit(SET_EXTERNAL_FEATURES, init.features);
            }
            if (init.poster) {
                commit(SET_EXTERNAL_POSTER, init.poster);
            }
            if (init.title) {
                commit(SET_EXTERNAL_TITLE, init.title);
            }
            if (init.lang) {
                commit(SET_LANG, init.lang);
                i18n.locale = init.lang;
            }
            if (init.userLang) {
                commit(SET_USER_LANG, init.userLang);
            }
            if (init.mode) {
                commit(SET_VIEW_MODE, init.mode);
            }

            if (init.i18n) {
                for (const l in init.i18n) {
                    const m = dot.dot(arrayToText(init.i18n[l]));
                    i18n.mergeLocaleMessage(l, m);
                }
            }
            if (init.header === false) {
                commit(SET_HEADER, false);
            }
            if (init.height) {
                commit(SET_HEIGHT, init.height);
            }
            if (init.width) {
                commit(SET_WIDTH, init.width);
            }
        },
        async fetchTorrent({ state, commit, dispatch, getters }, newTorrent = null) {
            if (statsClient) {
                statsClient.close();
                statsClient = null;
            }
            const r = router.currentRoute;
            let torrent = state.torrent;
            if (typeof newTorrent == 'string') {
                const r = stringToTorrent(newTorrent);
                if (!r) {
                    newTorrent = await dispatch('fetchFromURL', newTorrent);
                } else {
                    newTorrent = r;
                }
            }
            let source = {};
            message.send('init');
            const init = await message.receiveOnce('init');
            // const init = {
            //   magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F',
            //   lang: 'en',
            //   i18n: {
            //     en: {
            //       common: {
            //         share: 'Shhh!',
            //       },
            //     },
            //   },
            // }
            if (init) {
                const r = await dispatch('processInit', init);
                if (r === false) return;
                source = {
                    torrentUrl: init.torrentUrl,
                    magnet: init.magnet,
                };
                message.receive('play', () => {
                    dispatch('play');
                });
                message.receive('pause', () => {
                    dispatch('pause');
                });
                message.receive('setPosition', async (val) => {
                    await dispatch('setPosition', val);
                    await dispatch('setPosition', null);
                });
                message.receive('open', async (val) => {
                    await dispatch('setState', {
                        torrent: state.torrent,
                        pwd: val.pwd,
                        file: val.file,
                    });
                    await dispatch('pushState');
                });
            } else {
                source = {
                    torrentUrl: r.query.torrent_url,
                    magnet: r.query.magnet,
                    downloadId: r.query.downloadId,
                };
            }
            if (JSON.stringify(omitEmpty(source)) == '{}' && !state.torrent && !newTorrent) {
                router.push({ name: 'intro' }).catch(() => {});
                return;
            }
            const magnet = torrent ? parseTorrent.toMagnetURI(torrent) : null;
            const newTorrentMagnet = newTorrent ? parseTorrent.toMagnetURI(newTorrent) : null;
            if ((!source.magnet || source.magnet == magnet)
                && !source.downloadId
                && !source.torrentUrl
                && (!newTorrent || newTorrentMagnet == magnet)) {
                return;
            }
            commit(SET_PROGRESS, 25);
            if (getters.isVideoMode) {
                commit(SET_LOAD_STATE, 'prepare to play');
            } else {
                commit(SET_LOAD_STATE, 'loading torrent');
            }
            try {
                if (newTorrent && (newTorrent.pieces && newTorrent.pieces.length > 0)) {
                    torrent = newTorrent;
                } else if (sdk && newTorrent && (!newTorrent.pieces || newTorrent.pieces.length == 0)) {
                    torrent = await dispatch('fetchMagnet', newTorrentMagnet);
                } else if (ext && source.downloadId) {
                    dispatch('log', `Fetch torrent downloadId=${source.downloadId}`)
                    const downloadId = parseInt(source.downloadId);
                    debug('request downloadId=%d', downloadId);
                    torrent = await ext.fetch(downloadId);
                } else if (sdk && source.torrentUrl) {
                    torrent = await dispatch('fetchFromURL', source.torrentUrl);
                } else if (sdk && source.magnet) {
                    torrent = await dispatch('fetchMagnet', source.magnet);
                }
                commit(SET_PROGRESS, 50);

                debug('Got torrent infoHash=%s', torrent.infoHash);
                if (!await dispatch('checkTorrent', torrent)) {
                    commit(SET_ABUSED);
                    commit(SET_PROGRESS, 0);
                    router.push({ name: 'intro' }).catch(() => {});
                    return;
                }
                await dispatch('pushTorrent', torrent);
                commit(SET_PROGRESS, 75);

                commit(SET_SEEDER, sdk.seeder.get(torrent.infoHash));
                if (sdk && sdk.params.cache) {
                    const cp = await state.seeder.completedPieces();
                    debug('Got torrent completed pieces length=%o', cp.length);
                    commit(SET_COMPLETED_PIECES, cp);
                }
                commit(SET_LOAD_STATE_SUCCESS);
                let pwd = null
                if (r.query.pwd && !newTorrent) pwd = r.query.pwd;
                if (init && init.pwd) pwd = init.pwd;
                let file = null;
                if (r.query.file && !newTorrent) file = r.query.file;
                if (init && init.file) file = init.file;
                await dispatch('setState', {
                    torrent,
                    pwd,
                    file,
                });
                commit(SET_PROGRESS, 100);
                message.send('torrent fetched', torrent);
                // event('Show', 'TORRENT_FETCHED', torrent.infoHash);
            } catch (e) {
                message.send('torrent error');
                await dispatch('setState', {});
                if (e == 'abused') {
                    commit(SET_ABUSED);
                } else {
                    commit(SET_LOAD_STATE_FAILURE);
                    debug(e);
                }
                commit(SET_PROGRESS, 0);
            }

            if (r.query.event == 'player-logo-click') {
                dispatch('event', {name: 'Player Logo Click'});
            }
            await dispatch('pushState');
        },
        async cleanTorrent({commit}) {
            commit(SET_TORRENT_SUCCESS, null);
            commit(SET_PWD_SUCCESS, null);
            commit(SET_FILE_SUCCESS, null);
            commit(SET_SOURCE, null);
        },
        async processFile({ commit, dispatch }, file) {
            if (!file) return;
            try {
                return await fileToTorrent(file);
            } catch (e) {
                console.log(e);
                commit(SET_TORRENT_FAILURE);
            }
        },
        async leave({ commit }) {
            commit(SET_SOURCE, null);
        },
        async nextFile({ state, dispatch, getters }) {
            const files = getters.ls;
            if (files < 2) return;
            let next = null;
            let skip = true;
            for (let f of files) {
                if (sdk.util.getMediaType(f.path) != sdk.util.getMediaType(state.playerFilePath)) {
                    continue;
                }
                if (!skip) {
                    next = f;
                    break;
                }
                if (`/${state.playerFilePath}` == f.path) skip = false;
            }
            if (!next) return;
            await dispatch('open', next.name);
        },
        async pushState({ state }) {
            if (state.torrent) {
                message.send('open', {
                    file: state.file,
                    pwd: state.pwd,
                });
                try {
                    debug('push state=%o', {
                        file: state.file,
                        pwd: state.pwd,
                    });
                    await router.push({
                        name: 'show', query: omitEmpty({
                            file: state.file,
                            pwd: state.pwd,
                            magnet: parseTorrent.toMagnetURI(state.torrent),
                            // mode: state.viewMode,
                            // id: state.id,
                        })
                    });
                } catch (err) {
                    console.log(err);
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                }
            } else {
                router.push({ name: 'intro' }).catch(() => {});
            }
        },
        async checkTorrent({}, torrent) {
            for (const f of torrent.files) {
                if (!stoplistCheck(f.path, config.stoplist)) {
                    return false;
                }
            }
            return true;
        },
        async updateCaption({ state, getters, commit }) {
            const source = await getters.captionSource;
            if (!source) {
                commit(SET_CAPTION, null);
                return;
            }
            const caption = await source.getEntry(state.time);
            commit(SET_CAPTION, caption);
        },
        async updateTime({ commit, getters, dispatch, state }, { time, file }) {
            commit(SET_PLAYER_TIME, time);
            dispatch('updateCaption');
            dispatch('updateFileState', file);
            if (state.lastTime === null) {
                commit(SET_LAST_TIME, time);
            } else if (time - logTimePeriod - 5 > state.lastTime) {
                commit(SET_LAST_TIME, time);
                state.lastTime = time;
            } else if (time - logTimePeriod > state.lastTime) {
                dispatch('event', { name: 'Content Playtime', payload: { metric1: time - state.lastTime } });
                commit(SET_LAST_TIME, time);
            }
            message.send('current time', time);
        },
        async setDuration({ }, val) {
            message.send('duration', val);
        },
        firstPlay({commit, dispatch}) {
            commit(SET_FIRST_PLAY, false);
            dispatch('event', { name: 'Content Plays' });
        },
        async setPosition({ commit }, val) {
            commit(SET_NEW_POSITION, val);
        },
        // async setTrack({ commit, dispatch, state, getters }, track) {
        //     await dispatch('updateSource');
        //     await dispatch('updateFileState', state.file);
        //     await dispatch('updateCaption');
        // },
        async processAutoSubtitles(store) {
            const track = await getRelevantTrack(store);
            const {dispatch} = store;
            if (track) {
                dispatch('player/setSubtitle', track);
            }
        },
        async updateAttachedTracks({ state, commit, getters }) {
            let tracks = [];

            const md = clean(getters.metadata);
            md.invoke = false;

            for (const s of state.externalSubtitles) {
                let autoselect = false;
                if (s.autoselect === true) autoselect = true;
                if (s.default === true || s.default === "") autoselect = true;
                tracks.push({
                    kind: 'subtitles',
                    label: s.label,
                    srclang: s.srclang,
                    src: await sdk.ext.streamUrl(s.src, {}, md),
                    hash: md5(s.src + s.label),
                    autoselect,
                    type: 'ext',
                });
            }
            for (const s of state.hls.subtitles) {
                tracks.push({
                    kind: 'subtitles',
                    label: s.label,
                    srclang: s.srclang,
                    hash: md5(s.src),
                    src: new Url(s.src),
                    autoselect: s.autoselect,
                    default: s.default,
                    forced: s.forced,
                    type: 'hls',
                });
            }

            if (state.torrent) {
                for (let f of state.torrent.files) {
                    if (sdk.util.getMediaType(f.name) == 'subtitle' && f.name.startsWith(getters.fileName)) {
                        const lang = sdk.util.getSubtitleLang(f.name)
                        tracks.push({
                            kind: 'subtitles',
                            label: lang ? lang.nativeName : f.name,
                            srclang: lang ? lang.code : 'en',
                            src: await state.seeder.streamUrl(f.path, md),
                            hash: md5(state.infoHash + f.name),
                        });
                    }
                }
            }
            tracks = processSubtitles(tracks);
            commit(SET_ATTACHED_TRACKS, tracks);
        },
        async updateSource({ state, getters, commit }) {
            const format = sdk.util.getMediaType(state.file);
            const sources = await getters.sources;
            const tracks = await getters.tracks;
            const poster = await getters.poster;
            const autoplay = getters.isAutoplay;
            const source = {
                format,
                sources,
                tracks,
                autoplay,
                poster,
            };
            debug('setting source=%o', source);
            commit(SET_SOURCE, source);
        },
        async updateFileState({ state, commit }, file = null) {
            if (!file) file = state.file;
            if (!state.file || !state.torrent || !state.pwd || state.file != file) return;
            let data = {
                infoHash: state.torrent.infoHash,
                pwd: state.pwd,
                file: state.file,
                subtitle: cleanPlayerTrack(state.player.subtitle),
                audio: cleanPlayerTrack(state.player.audio),
                time: state.time,
            };
            data = await db.updateFileState(data);
            commit(SET_FILE_STATE, data);
        },
        async init({ dispatch, commit }) {
            await Promise.all([
                dispatch('checkApi'),
                dispatch('getRecentTorrents'),
                dispatch('getUserSettings'),
                dispatch('initRouter'),
                dispatch('initWindowWidth'),
            ]);
            commit(SET_INITED);
            debug('inited');
        },
        updateWindowWidth({commit}) {
            commit(UPDATE_WINDOW_WIDTH);
        },
        async checkApi({commit}) {
            if (!sdk) return;
            try {
                await sdk.checkApi();
            } catch (e) {
                commit(SET_API_UNREACHABLE);
                debug(e);
            }
        },
        async initWindowWidth({commit}) {
            if (typeof window !== "undefined") {
                window.addEventListener('resize', debounce(() => {
                    commit(UPDATE_WINDOW_WIDTH);
                }, 1000));
            }
        },
        async initAdScripts({getters}) {
            if (adScriptsInited || !getters.displayPopups) return;
            adScriptsInited = true;
            for (const ss of config.adScripts) {
                if (ss.context && ss.context.embed === false && getters.isEmbedded) {
                    continue;
                }
                const s = document.createElement('script');
                s.type = 'text/javascript';
                s.setAttribute('data-cfasync', 'false');
                s.src = ss.src;
                document.body.appendChild(s);
            }
        },
        async initAdsense() {
            if (adsenseInited) return;
            adsenseInited = true;
            const s1 = document.createElement('script');
            s1.type = 'text/javascript';
            s1.setAttribute('async', 'true');
            s1.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + config.adsense.client;
            s1.crossOrigin= 'anonymous';
            document.body.appendChild(s1);
        },
        async placeAdsenseAd({getters, dispatch}, {slot, name, format, style, placeholder}) {
            if (!getters.displayAdsense) return;
            dispatch('initAdsense');
            if (name) {
                slot = config.adsense.slots[name];
            }
            if (!style) style = 'display:block'
            let code = `<ins class="adsbygoogle"`;
            code += ` style="${style}"`;
            code += ` data-ad-client="${config.adsense.client}"`;
            code += ` data-ad-slot="${slot}"`;
            if (format) code += ` data-ad-format="${format}"`;
            code += ` data-full-width-responsive="true"></ins>`;
            let tries = 0;
            var checkExist = setInterval(function() {
                if (tries > 30) {
                    clearInterval(checkExist);
                    return;
                }
                if (document.getElementById(placeholder) && ('adsbygoogle' in window) && document.getElementById(placeholder).offsetWidth > 0) {
                    document.getElementById(placeholder).innerHTML = code;
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    clearInterval(checkExist);
                    return;
                }
                tries++;
            }, 100);
        },
        async initRouter({state, commit, dispatch}) {
            router.beforeEach(async (to, from, next) => {
                // if (to.hash.startsWith('#/')) {
                //     router.replace(to.hash.replace('#/', '')).catch(() => {});
                //     return;
                // }
                if (typeof window !== "undefined") {
                    const url = new URL(window.location);
                    if ((url.pathname != '/' || url.search != '')) {
                        history.replaceState({}, '', '/');
                        router.replace(url.pathname + url.search);
                        return;
                    }
                }
                let page_title = to.name;
                let page_path = to.path;
                if (to.query.magnet) {
                    page_path = '/' + parseTorrent(to.query.magnet).infoHash;
                    if (to.query.pwd) {
                        page_path += to.query.pwd;
                        page_title = to.query.pwd;
                    }
                    if (to.query.file) {
                        page_path += '/' + to.query.file;
                        page_title = to.query.file;
                    }
                }
                if (Vue.$gtag) {
                    Vue.$gtag.pageview({
                        page_path,
                        page_title,
                    });
                }
                if (to.query.mode == VIDEO || state.viewMode == VIDEO) {
                    commit(SET_VIEW_MODE, VIDEO);
                }
                if (to.query.mode == DOWNLOAD || state.viewMode == DOWNLOAD) {
                    commit(SET_VIEW_MODE, DOWNLOAD);
                }
                if (from.params.lang && !to.params.lang) {
                    return router.push(getLangRoute(to, from.params.lang)).catch(() => {});
                }
                if (to.params.lang) {
                    commit(SET_LANG, to.params.lang);
                    i18n.locale = to.params.lang;
                }
                if (to.hash || (to.name && to.name.startsWith('magnet-uri')) || (to.name && to.name.startsWith('infohash'))) {
                    let input = '';
                    if (to.name && to.name.startsWith('infohash')) {
                        input = to.params.infohash;
                    } else if (to.name && to.name.startsWith('magnet-uri')) {
                        input = decodeURIComponent(to.fullPath.substring(1));
                        input = input.match(/magnet\:.*/)[0];
                    } else {
                        input = to.hash.substring(1);
                    }
                    try {
                        const data = parseTorrent(input);
                        const magnet = parseTorrent.toMagnetURI(data);
                        return router.push({
                            name: 'show',
                            query: {
                                magnet,
                            },
                        }).catch(() => {});
                    } catch (e) {
                        debug(e);
                    }
                }
                return next();
            });
        },
        async getUserSettings({ commit }) {
            if (!db) return;
            const settings = await db.getUserSettings();
            commit(SET_USER_SETTINGS, settings);
        },
        async updateUserSettings({ state }) {
            const settings = {
                captionSize: state.captionSize,
            };
            db.updateUserSettings(settings);
        },
        async getRecentTorrent(_, infoHash) {
            return await db.pullTorrent(infoHash);
        },
        async getRecentTorrents({ commit }) {
            if (!db) return;
            const torrents = await db.getRecentTorrents();
            const res = {};
            for (const t of torrents) {
                res[t.infoHash] = t;
            }
            commit(SET_RECENT_TORRENTS, res);
        },
        async updatePlayerStatus({commit}, status) {
            message.send('player status', status);
            commit(SET_PLAYER_STATUS_SUCCESS, status);
        },
        playerInited() {
            message.send('inited');
        },
    };
};