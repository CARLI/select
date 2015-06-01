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

module.exports = {
    list: list,
    load: load,
    create: create,
    update: update
};
