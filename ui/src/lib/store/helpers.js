const md5 = require('md5');

export function randomId(prefix = '') {
  return md5(prefix + Date.now().toString());
}

export function clean(data) {
  return Object.assign({}, data);
}

export function cleanState({name, pwd, file, torrent}) {
  return {
    name,
    pwd,
    file,
    torrent: torrent ? torrent.infoHash : null,
  };
}

export function cleanPlayerTrack(track) {
  if (!track || !track.src) return track;
  const res = Object.assign({}, track);
  let href = '';
  if (typeof res.src === 'object') {
    href = res.src.href;
  } else {
      href = res.src;
  }
  res.src = href.split("?")[0];
  return res;
}

export function processSubtitles(subs) {
  subs = subs.sort((a, b) => {
    a = a.srclang;
    b = b.srclang;
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  let same = [];
  for (const i in subs) {
    if (i == 0) continue;
    if (subs[i].label == subs[i - 1].label) {
      if (same.length == 0) {
        same.push(subs[i - 1]);
      }
      same.push(subs[i]);
    } else {
      if (same.length > 0) {
        for (const y in same) {
          const idx = parseInt(y) + 1;
          same[y].label = same[y].label + ' #' + idx;
        }
      }
      same = [];
    }
  }
  return subs;
}