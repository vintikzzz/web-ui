const debug = require('debug')('webtor:lib:stoplistCheck');
function findKeyword(k, s) {
    return k == s || k.startsWith(s + " ") || k.endsWith(" " + s) || k.includes(" " + s + " ");
}

function findKeywordSpaces(k, s) {
    return findKeyword(k, s) || findKeyword(k, s.replace(/\s+/g, ''));
}

function findKeywordWithPipes(k, s) {
    const parts = s.split('|');
    for (const p of parts) {
        if (findKeywordSpaces(k, p)) {
            return true;
        }
    }
    return false;
}
function findKeywordWithPlus(k, s) {
    const parts = s.split('+');
    let found = true;
    for (const p of parts) {
        if (!findKeywordWithPipes(k, p)) {
            found = false;
        }
    }
    return found;
}
export default function(str, stoplist) {
    console.log(str, str.toLowerCase());
    const k = str.toLowerCase().replace(/[^\w]/g, ' ').replace(/(\d+)/g, ' $1 ').replace(/\s+/g, ' ');
    for (const s of stoplist) {
        if (s == "") continue; 
        if (findKeywordWithPlus(k, s)) {
            return false;
        }
    }
    return true;
}