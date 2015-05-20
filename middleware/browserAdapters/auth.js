var middlewareRequest = require('./middlewareRequest');

function logIn(user) {
    return middlewareRequest({
        path: '/login',
        method: 'post',
        json: true,
        body: user
    });
}

module.exports = {
    logIn: logIn
};
