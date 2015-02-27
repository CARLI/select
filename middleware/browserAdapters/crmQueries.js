var middlewareRequest = require('./middlewareRequest');

function listLibraries() {
    return middlewareRequest({
        path: '/library/',
        method: 'get',
        json: true
    });
}
function loadLibrary(id) {
    return middlewareRequest({
        path: '/library/' + id,
        method: 'get',
        json: true
    });
}

module.exports = {
    listLibraries: listLibraries,
    loadLibrary: loadLibrary
};
