var middlewareRequest = require('./middlewareRequest');

function createSession(userLogin) {
    return middlewareRequest({
        path: '/login',
        method: 'post',
        json: true,
        body: userLogin
    });
}

function deleteSession() {
    return middlewareRequest({
        path: '/login',
        method: 'delete'
    });
}

function masqueradeAsLibrary(libraryId) {
    return middlewareRequest({
        path: '/masquerade/library/' + libraryId,
        method: 'post'
    });
}

function masqueradeAsVendor(vendorId) {
    return middlewareRequest({
        path: '/masquerade/vendor/' + vendorId,
        method: 'post'
    });
}

module.exports = {
    createSession: createSession,
    deleteSession: deleteSession,
    masqueradeAsLibrary: masqueradeAsLibrary,
    masqueradeAsVendor: masqueradeAsVendor
};
