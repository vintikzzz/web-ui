export default function(pieces, piecesLength, progressLength) {
    const segments = [];
    let curSegment = null; 
    let prevPiece = null; 
    for (const p of pieces) {
    if (prevPiece != null) {
        if ((p.position - 1) != prevPiece.position) {
        if (curSegment != null) {
            segments.push(curSegment);
        }
        curSegment = {start: p.position, end: p.position + 1};
        } else {
        if (curSegment != null) {
            curSegment.end = p.position + 1;
        }
        }
    } else {
        curSegment = {start: p.position, end: p.position + 1};
    }
    prevPiece = p;
    }
    if (curSegment != null) {
    segments.push(curSegment);
    }
    for (const i in segments) {
    segments[i] = {
        start: segments[i].start / piecesLength * progressLength,
        end:   segments[i].end   / piecesLength * progressLength,
    };
    }
    return segments;
}