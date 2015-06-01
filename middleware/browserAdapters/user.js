var middlewareRequest = require('./middlewareRequest');

function list() {
    return middlewareRequest({
        path: '/user/list',
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

module.exports = {
    list: list,
    load: load
};
