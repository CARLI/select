var middlewareRequest = require('./middlewareRequest');

function createSession(userLogin) {
    return middlewareRequest({
        path: '/login',
        method: 'post',
        json: true,
        body: userLogin
    });
}

module.exports = {
    createSession: createSession
};
