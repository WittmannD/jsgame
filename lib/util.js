function normalize(val) {
    return val > 0 ? val : 360 + val;
}

function coordsToIndex(x, y, height) {
    return y * height + x;
}

function radiansToDegrees(val) {
    return normalize(val * 180 / Math.PI);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    normalize,
    coordsToIndex,
    radiansToDegrees,
    randomInt
}