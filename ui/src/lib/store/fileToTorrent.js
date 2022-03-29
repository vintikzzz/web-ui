import parseTorrent from 'parse-torrent';
export default function fileToTorrent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      const arr = new Uint8Array(e.target.result);
      const buffer = new Buffer(arr);
      try {
        resolve(parseTorrent(buffer));
      } catch(e) {
        reject(e);
      }
    });
    reader.addEventListener('error', (err) => {
      reject(err);
    });
    reader.readAsArrayBuffer(file);
  });
};
