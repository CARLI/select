var middlewareRequest = require('./middlewareRequest');

function list() {
    return middlewareRequest({
        path: '/user/list',
        method: 'get',
        json: true
    });
}

module.exports = {
    list: list
};
