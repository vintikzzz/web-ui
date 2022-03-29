import parseTorrent from 'parse-torrent';
const debug = require('debug')('webtor:lib:ext');
class Ext {
  init() {
    return new Promise((resolve, reject) => {
      if (window.__webtorInjected) return resolve();
      debug('wait for initialization');
      window.addEventListener('message', (event) => {
        if (event.source != window)
          return;

        if (event.data.webtorInjected) return resolve();
      });
    });
  }
  async fetch(downloadId) {
    await this.init();
    debug('request downloadId=%d', downloadId);
    return new Promise((resolve, reject) => {
      window.addEventListener('message', (event) => {
        if (event.source != window)
          return;

        if (event.data.torrent) {
          const ab = new Uint8Array(event.data.torrent.data);
          const buffer = new Buffer(ab.byteLength);
          const view = new Uint8Array(ab);
          for (let i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
          }
          try {
          const torrent = parseTorrent(buffer);
          debug('resolve torrent infoHash=%s', torrent.infoHash);
          resolve(torrent);
          } catch (e) {
            reject(e);
          }
        }
      });
      window.postMessage({downloadId}, '*');
    });
  }
}
export function createExt() {
  return new Ext();
}
