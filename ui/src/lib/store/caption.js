const debug = require('debug')('webtor:lib:captions');
import throttle from 'lodash/throttle';
const debugFetch = function(url) {
    debug('fetch caption url=%o', url);
    return fetch(url);
}
const retryFetch = require('fetch-retry')(debugFetch, {
    retries: 5,
    retryDelay: function(attempt, error, response) {
        return Math.pow(2, attempt) * 1000;
    },
    retryOn: function(attempt, error, response) {
        if (error !== null || response.status >= 500) {
            debug('got captions error retry count=%o', attempt);
            return true;
        }
    },
});
async function getHLSFragments(srcUrl) {
    const res = await(retryFetch(srcUrl));
    const src = await res.text();
    const parentUrl = srcUrl.substring(0, srcUrl.lastIndexOf( "/" ) + 1);
    const fragments = [];
    const lines = src.split("\n");
    let current = 0;
    let num = 0;
    let fragment = {};
    let ended = false;
    for (const l of lines) {
        const m = l.match('#EXTINF:([0-9\.]+),');
        if (l == '#EXT-X-ENDLIST') {
            ended = true;
        }
        if (m) {
            fragment.num = num;
            fragment.length = parseFloat(m[1]);
            num++;
        }
        if (l.match('^[^#]')) {
            fragment.name = l;
            fragment.src = parentUrl + fragment.name;
        }
        if (fragment.name !== undefined) {
            fragments.push(fragment);
            fragment.content = function(f) {
                let prom = null;
                return function() {
                    if (prom === null) {
                        prom = new Promise(async function(resolve, reject) {
                            const res = await(retryFetch(f.src));
                            const src = await res.text();
                            resolve(src);
                        });
                    }
                    return prom;
                }
            }(fragment);
            fragment = {start: current};
        }
    }
    return {fragments, ended};
}

function convertSMPTEtoSeconds(SMPTE) {

	if (typeof SMPTE !== 'string') {
		throw new TypeError('Argument must be a string value');
	}

	SMPTE = SMPTE.replace(',', '.');

	const decimalLen = ~SMPTE.indexOf('.') ? SMPTE.split('.')[1].length : 0;

	let
		secs = 0,
		multiplier = 1
	;

	SMPTE = SMPTE.split(':').reverse();

	for (let i = 0, total = SMPTE.length; i < total; i++) {
		multiplier = 1;
		if (i > 0) {
			multiplier = Math.pow(60, i);
		}
		secs += Number(SMPTE[i]) * multiplier;
	}
	return Number(secs.toFixed(decimalLen));
}

function parseDFXP(trackText) {
    trackText = $(trackText).filter('tt');
    const
        container = trackText.firstChild,
        lines = container.querySelectorAll('p'),
        styleNode = trackText.getElementById(`${container.attr('style')}`),
        entries = []
    ;

    let styles;

    if (styleNode.length) {
        styleNode.removeAttribute('id');
        const attributes = styleNode.attributes;
        if (attributes.length) {
            styles = {};
            for (let i = 0, total = attributes.length; i < total; i++) {
                styles[attributes[i].name.split(":")[1]] = attributes[i].value;
            }
        }
    }

    for (let i = 0, total = lines.length; i < total; i++) {
        let
            style,
            _temp = {
                start: null,
                stop: null,
                style: null,
                text: null
            }
        ;

        if (lines.eq(i).attr('begin')) {
            _temp.start = convertSMPTEtoSeconds(lines.eq(i).attr('begin'));
        }
        if (!_temp.start && lines.eq(i - 1).attr('end')) {
            _temp.start = convertSMPTEtoSeconds(lines.eq(i - 1).attr('end'));
        }
        if (lines.eq(i).attr('end')) {
            _temp.stop = convertSMPTEtoSeconds(lines.eq(i).attr('end'));
        }
        if (!_temp.stop && lines.eq(i + 1).attr('begin')) {
            _temp.stop = convertSMPTEtoSeconds(lines.eq(i + 1).attr('begin'));
        }

        if (styles) {
            style = '';
            for (let _style in styles) {
                style += `${_style}:${styles[_style]};`;
            }
        }
        if (style) {
            _temp.style = style;
        }
        if (_temp.start === 0) {
            _temp.start = 0.200;
        }
        _temp.text = lines.eq(i).innerHTML.trim().replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
        entries.push(_temp);
    }
    return entries;
}

function parseWebVTT(trackText) {
    const
        lines = trackText.split(/\r?\n/),
        entries = [],
        pattern = /^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/
    ;
    let
        timecode,
        text,
        identifier
    ;

    for (let i = 0, total = lines.length; i < total; i++) {
        timecode = pattern.exec(lines[i]);

        if (timecode && i < lines.length) {
            if ((i - 1) >= 0 && lines[i - 1] !== '') {
                identifier = lines[i - 1];
            }
            i++;
            // grab all the (possibly multi-line) text that follows
            text = lines[i];
            i++;
            while (lines[i] !== '' && i < lines.length) {
                text = `${text}\n${lines[i]}`;
                i++;
            }
            text = text.trim().replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
            entries.push({
                identifier: identifier,
                start: (convertSMPTEtoSeconds(timecode[1]) === 0) ? 0.200 : convertSMPTEtoSeconds(timecode[1]),
                stop: convertSMPTEtoSeconds(timecode[3]),
                text: text,
                settings: timecode[5]
            });
        }
        identifier = '';
    }
    return entries;
}

function parse(str) {
    return typeof str === 'string' && (/<tt\s+xml/ig).exec(str) ?
        parseDFXP(str) : parseWebVTT(str);
}

function sanitize(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    // Remove all `<script>` tags first
    const scripts = div.getElementsByTagName('script');
    let i = scripts.length;
    while (i--) {
        scripts[i].remove();
    }

    // Loop the elements and remove anything that contains value="javascript:" or an `on*` attribute
    // (`onerror`, `onclick`, etc.)
    const allElements = div.getElementsByTagName('*');
    for (let i = 0, n = allElements.length; i < n; i++) {
        const
            attributesObj = allElements[i].attributes,
            attributes = Array.prototype.slice.call(attributesObj)
        ;

        for (let j = 0, total = attributes.length; j < total; j++) {
            if (attributes[j].name.startsWith('on') || attributes[j].value.startsWith('javascript')) {
                allElements[i].remove();
            } else if (attributes[j].name === 'style') {
                allElements[i].removeAttribute(attributes[j].name);
            }
        }

    }
    return div.innerHTML;
}

function isDataURI(url) {
    return url.match(/^data:(?:.+?\/.+?)?(?:;.+?=.+?)*(?:;base64)?,.*$/);
}
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function searchTrackPosition(tracks, currentTime) {
    let
        lo = 0,
        hi = tracks.length - 1,
        mid,
        start,
        stop
    ;

    while (lo <= hi) {
        mid = ((lo + hi) >> 1);
        start = tracks[mid].start;
        stop = tracks[mid].stop;

        if (currentTime >= start && currentTime < stop) {
            return mid;
        } else if (start < currentTime) {
            lo = mid + 1;
        } else if (start > currentTime) {
            hi = mid - 1;
        }
    }

    return -1;
}

class BasicSource {
    constructor(src) {
        this.entries = parse(src);
    }
    getEntry(time) {
        const i = searchTrackPosition(this.entries, time)
        if (i > -1) return this.entries[i];
        return null;
    }
}

class HLSSource {
    constructor(src) {
        this.src = src;
        this.fragments = [];
        this.fetching = false;
        this.ended = false;
        this.entries = [];
        this.entriesByFragment = [];
        this.lastTime = 0;
        this.lastIndex = 0;
        this.lookAhead = 60*5;
        this.getHLSFragments = throttle(getHLSFragments, 5000, {
            trailing: false,
        });
    }
    findFragment(time) {
        for (const f of this.fragments) {
            if (time > f.start && time < f.end) {
                return f;
            }
        }
    }
    async importEntries(f) {
        if (f.num in this.entriesByFragment) return;
        const c = await f.content();
        const entries = parse(c);
        this.entriesByFragment[f.num] = entries;
        if (entries.length == 0) return;
        let temp = [];
        for (const e of this.entriesByFragment) {
            if (e) temp = temp.concat(e);
        }
        this.entries = temp;
    }
    async preload(time) {
        let i;
        for (i = this.lastIndex; i < this.fragments.length && this.lastTime < time + this.lookAhead; i++) {
            await this.importEntries(this.fragments[i]);
            this.lastTime = this.entries.slice(-1)[0].start;
        }
        this.lastIndex = i;
    }
    async loadFragments(time) {
        if (this.lastTime >= time + this.lookAhead) return;
        if (!this.ended) {
            const {fragments, ended} = await this.getHLSFragments(this.src);
            this.fragments = fragments;
            this.ended = ended;
        }
        await this.preload(time);
    }
    async getEntry(time) {
        this.loadFragments(time);
        const i = searchTrackPosition(this.entries, time)
        if (i > -1) return this.entries[i];
        return null;
    }
}

function makeBasicSource(src) {
    return new BasicSource(src);
}

function makeHLSSource(src) {
    return new HLSSource(src);
}

async function getCaptionSource(src) {
    if (!src) {
        return null;
    } else if (isDataURI(src)) {
        return makeBasicSource(b64DecodeUnicode(src.split(',')[1]));
    } else if (src.match(/\.(srt|vtt)/)) {
        const res = await(retryFetch(src));
        const data = await res.text();
        return makeBasicSource(data);
    } else if (src.match(/\.m3u8/)) {
        return makeHLSSource(src);
    }
}

export {getCaptionSource, sanitize};