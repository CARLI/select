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

function deleteUser(user){
    return middlewareRequest({
        path: '/user/' + user.email,
        method: 'delete',
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

function notifyCarliOfNewLibraryUser(user, library) {
    return middlewareRequest({
        path: '/notify-user-creation',
        method: 'put',
        json: { user: user, library: library }
    });
}

function configureForMasquerading(role, id) {
    return middlewareRequest({
        path: '/masquerade/' + role + '/' + id,
        method: 'post'
    });
}

module.exports = {
    list: list,
    load: load,
    create: create,
    update: update,
    delete: deleteUser,
    requestPasswordReset: requestPasswordReset,
    isKeyValid: isKeyValid,
    consumeKey: consumeKey,
    configureForMasquerading: configureForMasquerading,
    notifyCarliOfNewLibraryUser: notifyCarliOfNewLibraryUser
};
