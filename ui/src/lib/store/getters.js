import {VIDEO, DOWNLOAD} from './viewModeTypes';
import {ls} from './fileUtils';
const pathParse = require('path-parse');
import {getCaptionSource} from './caption';
const md5 = require('md5');
import parseTorrent from 'parse-torrent';
import {clean, processSubtitles, randomId} from './helpers';

export default function ({i18n, sdk, message, config}) {
    return {
        gtagDimensions(state, getters) {
            return {
                'dimension1': getters.fileExt.replace(/^\./, '').toLowerCase(), // Content Type
                'dimension2': getters.deliveryType == 'transcode', // Content Transcoded?
                'dimension3': getters.mediaType, // Content Format
                'dimension4': getters.isAutoplay, // Autoplay?
                'dimension5': state.file, // Content Name
                'dimension6': state.torrent.infoHash, // Torrent Infohash
                'dimension8': getters.isAdblock, // Adblock Enabled?
                'dimension9': getters.isSponsor, // Is Sponsor?
                'dimension10': getters.filePath, // Content Path
                'dimension11': getters.isEmbedded, // Content Path
            };
        },
        gtagDownloadDimensions(state, getters) {
            return {
                'dimension6': state.torrent.infoHash, // Torrent Infohash
                'dimension8': getters.isAdblock, // Adblock Enabled?
                'dimension9': getters.isSponsor, // Is Sponsor?
            };
        },
        sdk: () => sdk,
        torrentFile: (state) => ls(state.torrent, state.pwd, state.file)[0],
        title: (state) => 'Webtor.io',
        isEmbedded: (state, getters) => getters.isVideoMode || getters.isDownloadMode,
        iOS() {
            if (typeof window === 'undefined') return false;
            return [
              'iPad Simulator',
              'iPhone Simulator',
              'iPod Simulator',
              'iPad',
              'iPhone',
              'iPod'
            ].includes(window.navigator.platform)
            // iPad on iOS 13 detection
            || (window.navigator.userAgent.includes("Mac") && "ontouchend" in document)
        },
        showShare: (state, getters) => !getters.isEmbedded,
        showLogo: (state, getters) => !getters.isEmbedded,
        showDownload: (state, getters) => !getters.isEmbedded,
        showStatus: (state, getters) => !getters.isEmbedded,
        selfHosted: () => config.selfHosted,
        isAutoplay: (state) => state.autoplay,
        isVideoMode: (state) => state.viewMode == VIDEO,
        isDownloadMode: (state) => state.viewMode == DOWNLOAD,
        preroll: (state) => state.preroll,
        isIndia: (state) => state.country == 'IN',
        underPlayerBanner: (state) => state.underPlayerBanner,
        warnBanner: (state) => state.warnBanner,
        shareLink: (state) => {
            return window.location.origin + '/' + state.torrent.infoHash;
        },
        magnetURI: (state) => {
            return parseTorrent.toMagnetURI(state.torrent);
        },
        blogUrl: (state) => {
            const lang = state.lang;
            return `https://blog.webtor.io/${lang}/post/`;
        },
        backersUrl: (state) => {
            const lang = state.lang;
            return `https://blog.webtor.io/${lang}/backers/`;
        },
        technologyUrl: (state) => {
            const lang = state.lang;
            return `https://blog.webtor.io/${lang}/technology/`;
        },
        metadata: (state) => {
            const md = {};
            if (state.userID) {
                md['user-id'] = state.userID;
            }
            return md;
        },
        translations: (state) => i18n.messages,
        ls: (state) => ls(state.torrent, state.pwd),
        currentVideoFiles: (state, getters) => {
            const res = [];
            for (const f of getters.ls) {
                if (sdk.util.getMediaType(f.name) == 'video') {
                    res.push(f.name);
                }
            }
            return res;
        },
        currentVideoFilesWithFriendlyNames: (state, getters) => {
            const res = [];
            for (const name of getters.currentVideoFiles) {
                let friendlyName = pathParse(name).name;
                if (friendlyName.match(/s\d+/i) && friendlyName.match(/e\d+/i)) {
                    const mm = friendlyName.match(/e(\d+)/i);
                    const num = (parseInt(mm[1]) + '').padStart(2, '0');
                    friendlyName = i18n.t('common.episode') + ' ' + num;
                }
                res.push({
                    name,
                    friendlyName,
                });
            }
            return res;
        },
        currentPrimaryVideoFiles: (state, getters) => {
            return getters.currentVideoFiles.filter((v) => !v.match(/sample/i));
        },
        currentInfoHash: (state) => {
            return state.torrent ? state.torrent.infoHash : null;
        },
        isDemo: (state, getters) => {
            return getters.currentInfoHash == '08ada5a7a6183aae1e09d831df6748d566095a10';
        },
        displayAds: (state, getters) => {
            if (getters.isDemo) return false;
            if (config.ads == false) return false;
            if (getters.isSponsor) return false;
            return true;
        },
        displayPopups: (state, getters) => {
            return getters.displayAds;
        },
        displayAdsense: (state, getters) => {
            if (config.adsense == false) return false;
            if (config.ads == false) return false;
            if (getters.isSponsor) return false;
            if (getters.isEmbedded) return false;
            return true;
        },
        displayAdfox: (state, getters) => {
            if (config.ads == false) return false;
            if (getters.isSponsor) return false;
            if (getters.isEmbedded) return false;
            return true;
        },
        displayPrerolls: (state, getters) => {
            return false;
            // return getters.displayAds && getters.mediaType == 'video';
        },
        isAdblock: (state) => {
            return state.adblock;
        },
        isWindows: (state) => {
            return navigator.platform.indexOf('Win') > -1;
        },
        currentDir: (state) => {
            if (state.pwd == '/') return null;
            return state.pwd.split('/').slice(-1).pop();
        },
        deepLevel: (state) => {
            return state.pwd.split('/').length - 1;
        },
        deliveryType: (state) => {
            return sdk.util.getDeliveryType(state.file);
        },
        mediaType: (state) => {
            return sdk.util.getMediaType(state.file);
        },
        fileName: (state) => {
            return pathParse(state.file).name;
        },
        fileExt: (state) => {
            return pathParse(state.file).ext;
        },
        filePath: (state) => {
            if (state.file == null) return state.pwd;
            if (state.pwd == '/') {
                return state.file;
            } else {
                return state.pwd.substr(1) + '/' + state.file;
            }
        },
        downloadFile: (state) => {
            if (!state.downloadPath) return null;
            return pathParse(state.downloadPath).base;
        },
        downloadSize: (state) => {
            let l = 0;
            for (const f of state.torrent.files) {
                if (('/' + f.path).startsWith(state.downloadPath)) {
                    l += f.length;
                }
            }
            return l;
        },
        isSponsor: (state) => {
            if (!state.user) return false;
            return state.user && state.user.role && state.user.role != 'NOBODY';
        },
        sources: async (state, getters) => {
            const src = await state.seeder.streamUrl(getters.filePath, clean(getters.metadata));
            // const src = new Url('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8');
            // const src = new Url('http://localhost:8080/index.m3u8');
            const type = sdk.util.getMimeType(src);
            const title = 'main';
            return [{
                src,
                type,
                title,
            }];
        },
        poster: async (state, getters) => {
            const md = clean(getters.metadata);
            md.invoke = false;
            if (state.externalPoster) {
                return await sdk.ext.streamUrl(state.externalPoster, {}, md);
            }
            for (let f of state.torrent.files) {
                if (sdk.util.getMediaType(f.name) == 'image' && f.name.startsWith(getters.fileName)) {
                    return await state.seeder.streamUrl(f.path, md);
                }
            }
            const videos = getters.currentPrimaryVideoFiles;
            if (videos.length == 1) {
                const files = getters.ls;
                for (const f of files) {
                    if (sdk.util.getMediaType(f.name) == 'image' && f.name.match(/poster/)) {
                        return await state.seeder.streamUrl(f.path, md);
                    }
                }
            }
            return null;
        },
        captionSource(state) {
            if (!state.player.subtitle) return null;
            let src = state.player.subtitle.src;
            if (!src) return null;
            if (src.href) src = src.href;
            return getCaptionSource(src);
        },
        openSubtitlesTracks: async (state, getters) => {
            let tracks = [];
            const search = {};
            if (state.imdbId) {
                search['imdb-id'] = state.imdbId;
            }
            const os = await state.seeder.openSubtitles(getters.filePath, Object.assign(clean(getters.metadata), search));
            message.send('open subtitles', os);
            for (const o of os) {
                if (!['srt', 'vtt'].includes(o.format)) continue;
                const lang = sdk.util.getLang(o.srclang)
                tracks.push({
                    kind: 'subtitles',
                    label: lang.nativeName != "" ? lang.nativeName : o.label,
                    srclang: o.srclang,
                    src: o.src,
                    hash: md5(o.hash + o.id),
                });
            }
            tracks = processSubtitles(tracks);
            return tracks;
        },
        async tracks(state, getters) {
            let tracks = [];
            if (state.player.subtitle) {
                tracks = [state.player.subtitle];
            } else {
                tracks = state.attachedTracks;
            }
            let res = [];
            for (const t of tracks) {
                res.push(clean(t));
            }
            for (const t of res) {
                if (state.player.subtitle && t.hash == state.player.subtitle.hash) {
                    t.default = true;
                    break;
                } else if (t.autoselect) {
                    t.default = true;
                    break;
                }
            }
            return res;
        },
        hasLogin() {
            return config.patreon;
        },
        apiUrl() {
            return config.sdk.apiUrl;
        }
    };
};