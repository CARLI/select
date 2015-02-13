var Q = require('q');

function listLibraries() {
    return Q([ {
        name: 'Fake Library',
        type: 'Library'
    } ]);
}

function loadLibrary(id) {
    return Q({
        name: 'Fake Library',
        type: 'Library'
    });
}

module.exports = {
    listLibraries: listLibraries,
    loadLibrary: loadLibrary
};
