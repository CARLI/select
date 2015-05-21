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
        path: '/logout',
        method: 'delete'
    });
}

module.exports = {
    createSession: createSession,
    deleteSession: deleteSession
};
