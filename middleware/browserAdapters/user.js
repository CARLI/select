var middlewareRequest = require('./middlewareRequest');

function list() {
    return middlewareRequest({
        path: '/user',
        method: 'get',
        json: true
    });
}

function load(email) {
    return middlewareRequest({
        path: '/user/' + email,
        method: 'get',
        json: true
    });
}

function create(user) {
    return middlewareRequest({
        path: '/user',
        method: 'post',
        json: user
    });
}

function update(user) {
    return middlewareRequest({
        path: '/user/' + user.email,
        method: 'put',
        json: user
    });
}

function requestPasswordReset(email) {
    return middlewareRequest({
        path: '/user/' + email + '/reset',
        method: 'get',
        json: true
    });
}

function isKeyValid(key) {
    return middlewareRequest({
        path: '/user/validate-key/' + key,
        method: 'get',
        json: true
    })
}

function consumeKey(key, user) {
    return middlewareRequest({
        path: '/user/consume-key/' + key,
        method: 'put',
        json: user
    })
}

module.exports = {
    list: list,
    load: load,
    create: create,
    update: update,
    requestPasswordReset: requestPasswordReset,
    isKeyValid: isKeyValid,
    consumeKey: consumeKey
};