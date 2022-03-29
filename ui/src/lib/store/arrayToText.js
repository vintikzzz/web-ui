export default function arrayToText(obj) {
  for (let k in obj) {
    if (Array.isArray(obj[k])) {
      obj[k] = obj[k].join('\n');
    } else if (typeof obj[k] === 'object') {
      obj[k] = arrayToText(obj[k]);
    }
  }
  return obj;
};
