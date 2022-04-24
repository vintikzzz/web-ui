import parseTorrent from 'parse-torrent';
const Url = require('url-parse');
export default function stringToTorrent(s) {
    if (s.match(/^magnet/) || s.match(/^[a-fA-F0-9]{40}$/)) {
        return parseTorrent(s);
    }
    const u = Url(s, true);
    for (const k in u.query) {
        const t = stringToTorrent(u.query[k]);
        if (t) return t;
    }
    return false;
}