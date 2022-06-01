import Vue from 'vue';
import {SET_TORRENT_SUCCESS, SET_PWD_SUCCESS,
        SET_FILE_SUCCESS, SET_SOURCE, SET_PLAYER_STATUS_SUCCESS,
        SET_PLAYER_FILE_PATH_SUCCESS, SET_TORRENT_FAILURE,
        CLEAR_TORRENT_LOAD_ERROR, SET_STAT_SUCCESS,
        SET_LOAD_STATE, SET_LOAD_STATE_SUCCESS, SET_DELIVERY_FAILURE,
        CLEAR_DELIVERY_FAILURE, SET_DELIVERY_TOKEN, SET_LOAD_STATE_FAILURE,
        SET_DOWNLOAD_ID, SET_LANG, SET_ABUSED, SET_MEDIA_INFO,
        SET_PLAYER_TIME, SET_CURRENT_DIR_FILE_STATES, SET_FILE_STATE,
        SET_RECENT_TORRENTS, SET_RECENT_TORRENT,
        SET_ADBLOCK_ENABLED, SET_VIEW_MODE, SET_THEME,
        SET_EXTERNAL_SUBTITLES, SET_EXTERNAL_POSTER, SET_AUTOPLAY, SET_CAPTION, SET_PLAYER_CONTROLS_SHOWN,
        SET_PLAYER_FULLSCREEN, SET_HEADER, SET_EXTERNAL_TITLE, SET_HEIGHT, SET_WIDTH, SET_IMDBID,
        SET_COMPLETED_PIECES, CHANGE_CAPTION_SIZE, SET_USER_SETTINGS, SET_PLAYER_SOURCE_URL_SUCCESS,
        SET_ADS_INJECTED, SET_PLAYER_NATIVE_FULLSCREEN, SET_EXTERNAL_FEATURES, SET_EXTERNAL_CONTROLS,
        SET_NEW_POSITION, SET_DOWNLOAD_PATH, SET_SEEDER, SET_ZIP_DOWNLOAD,
        SET_ATTACHED_TRACKS, SET_LAST_TIME, SET_FIRST_PLAY, SET_IS_CACHED, SET_NAME,
        SET_DOWNLOAD_STAT, DROP_DOWNLOAD_STAT, SET_DOWNLOAD_TYPE, UPDATE_WINDOW_WIDTH, SET_INITED, SET_PROGRESS,
        SET_USER_LANG, SET_API_UNREACHABLE,
       } from './mutationTypes';
import {PLAYING, PAUSE, SEEKING, ENDED, IDLE} from './playerStatusTypes';
const debug = require('debug')('webtor:lib:store');
export default {
    [SET_INITED](state) {
        state.inited = true;
    },
    [UPDATE_WINDOW_WIDTH](state) {
        debug('update window width=%o', window.innerWidth);
        state.windowWidth = window.innerWidth;
    },
    [SET_NAME](state, val) {
        state.name = val;
    },
    [SET_PROGRESS](state, val) {
        state.progress = val;
    },
    [SET_IS_CACHED](state, val) {
        state.isCached = val;
    },
    [SET_ATTACHED_TRACKS](state, val) {
        state.attachedTracks = val;
    },
    [CHANGE_CAPTION_SIZE](state, val) {
        if (state.captionSize + val < 0) {
            return;
        }
        state.captionSize = state.captionSize + val;
    },
    [SET_ZIP_DOWNLOAD](state, val) {
        state.zipDownload = val;
    },
    [SET_ADS_INJECTED](state, val) {
        state.adsInjected = val;
    },
    [SET_COMPLETED_PIECES](state, val) {
        state.completedPieces = val;
    },
    [SET_WIDTH](state, val) {
        state.width = val;
    },
    [SET_HEIGHT](state, val) {
        state.height = val;
    },
    [SET_IMDBID](state, val) {
        state.imdbId = val;
    },
    [SET_EXTERNAL_SUBTITLES](state, subtitles) {
        state.externalSubtitles = subtitles;
    },
    [SET_HEADER](state, val) {
        state.header = val;
    },
    [SET_EXTERNAL_TITLE](state, val) {
        state.externalTitle = val;
    },
    [SET_EXTERNAL_FEATURES](state, val) {
        const features = {};
        for (const k in state.features) {
            features[k] = state.controls;
        }
        state.features = Object.assign(features, val);
    },
    [SET_EXTERNAL_CONTROLS](state, val) {
        state.controls = val;
    },
    [SET_AUTOPLAY](state, val) {
        state.autoplay = val;
    },
    [SET_CAPTION](state, val) {
        state.caption = val;
    },
    [SET_NEW_POSITION](state, val) {
        state.newPosition = val;
    },
    [SET_PLAYER_CONTROLS_SHOWN](state, val) {
        state.playerControlsShown = val;
    },
    [SET_PLAYER_FULLSCREEN](state, val) {
        state.playerFullScreen = val;
    },
    [SET_PLAYER_NATIVE_FULLSCREEN](state, val) {
        state.playerNativeFullScreen = val;
    },
    [SET_EXTERNAL_POSTER](state, poster) {
        state.externalPoster = poster;
    },
    [SET_VIEW_MODE](state, mode) {
        state.viewMode = mode;
    },
    [SET_THEME](state, theme) {
        state.theme = theme;
    },
    [SET_ADBLOCK_ENABLED](state) {
        state.adblock = true;
    },
    [SET_API_UNREACHABLE](state) {
        state.apiUnreachable = true;
    },
    [SET_LOAD_STATE](state, text) {
        state.loadState = text;
    },
    [SET_ABUSED](state) {
        state.loadState = false;
        state.abused = true;
    },
    [SET_LOAD_STATE_SUCCESS](state) {
        state.loadState = false;
        state.loadError = false;
    },
    [SET_LOAD_STATE_FAILURE](state) {
        state.loadState = false;
        state.loadError = true;
    },
    [SET_MEDIA_INFO](state, data) {
        state.mediaInfo = data;
    },
    [SET_PLAYER_TIME](state, data) {
        state.time = data;
    },
    [SET_FILE_STATE](state, data) {
        Vue.set(state.currentDirFileState, data.file, data);
    },
    [SET_DOWNLOAD_STAT](state, {p, m}) {
        Vue.set(state.downloadStats, p, m);
    },
    [DROP_DOWNLOAD_STAT](state, p) {
        Vue.delete(state.downloadStats, p);
    },
    [SET_TORRENT_SUCCESS](state, torrent) {
        if (state.torrent && torrent
            && torrent.infoHash == state.torrent.infoHash) {
            return;
        }
        state.torrent = torrent;
        state.file = null;
        state.pwd = '/';
        state.source = null;
        state.alterSource = null;
        state.playerStatus = null;
        state.playerFilePath = null;
        state.wrongFormat = false;
        state.loadError = false;
        state.deliveryFailure = false;
        state.stats = false;
        state.errors = {};
        if (state.torrent) {
            state.abused = false;
        }
        state.mediaInfo = null;
        state.playerStatus = IDLE;
    },
    [SET_PWD_SUCCESS](state, pwd) {
        if (state.pwd == pwd) return;
        if (!pwd) {
            state.pwd = '/';
        } else {
            state.pwd = pwd;
        }
        state.file = null;
        state.wrongFormat = false;
        state.deliveryFailure = false;
        state.playerStatus = IDLE;
    },
    [SET_DOWNLOAD_PATH](state, path) {
        state.downloadPath = path;
    },
    [SET_DOWNLOAD_TYPE](state, type) {
        state.downloadType = type;
    },
    [SET_FILE_SUCCESS](state, path) {
        if (state.file == path) return;
        state.file = path;
        state.wrongFormat = false;
        state.deliveryFailure = false;
        state.mediaInfo = null;
        state.caption = null;
        state.playerStatus = IDLE;
    },
    [SET_LANG](state, lang) {
        state.lang = lang;
    },
    [SET_USER_LANG](state, lang) {
        state.userLang = lang;
    },
    [SET_DOWNLOAD_ID](state, id) {
        state.downloadID = id;
    },
    [SET_SOURCE](state, source) {
        // if (state.playerFilePath != state.filePath) {
        //   state.playerFilePath = null;
        // }
        state.caption = null;
        state.source = source;
        state.playerFullScreen = false;
        state.playerControlsShown = true;
    },
    [SET_PLAYER_STATUS_SUCCESS](state, status) {
        state.playerStatus = status;
        if (status == SEEKING || status == ENDED) {
            state.lastTime = null;
        }
    },
    [SET_LAST_TIME](state, time) {
        state.lastTime = time;
    },
    [SET_PLAYER_FILE_PATH_SUCCESS](state, path) {
        state.playerFilePath = path;
    },
    [SET_PLAYER_SOURCE_URL_SUCCESS](state, url) {
        state.playerSourceUrl = url;
    },
    [SET_TORRENT_FAILURE](state) {
        state.wrongFormat = true;
    },
    [SET_DELIVERY_FAILURE](state, { header: { path }, message, data }) {
        Vue.set(state.errors, `/${path}`, message);
        state.deliveryFailure = { message, data };
    },
    [CLEAR_TORRENT_LOAD_ERROR](state) {
        state.wrongFormat = false;
    },
    [CLEAR_DELIVERY_FAILURE](state) {
        state.deliveryFailure = false;
    },
    [SET_DELIVERY_TOKEN](state, token) {
        state.deliveryToken = token;
    },
    [SET_STAT_SUCCESS](state, data) {
        state.stats = data;
    },
    [SET_CURRENT_DIR_FILE_STATES](state, states) {
        state.currentDirFileState = states;
    },
    [SET_RECENT_TORRENTS](state, torrents) {
        state.recentTorrents = torrents;
    },
    [SET_USER_SETTINGS](state, settings) {
        if (settings.captionSize) {
            state.captionSize = settings.captionSize;
        }
        if (settings.theme && !state.theme) {
            state.theme = settings.theme;
        }
    },
    [SET_RECENT_TORRENT](state, data) {
        Vue.set(state.recentTorrents, data.infoHash, data);
    },
    [SET_RECENT_TORRENT](state, data) {
        Vue.set(state.recentTorrents, data.infoHash, data);
    },
    [SET_SEEDER](state, seeder) {
        state.seeder = seeder;
    },
    [SET_FIRST_PLAY](state, val) {
        state.firstPlay = val;
    },
};