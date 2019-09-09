
const middlewareRequest = require('./middlewareRequest');

function getConfig(key) {
    return middlewareRequest({
        path: '/get-config/' + key,
        method: 'get'
    }).then(response => response.result);
}

module.exports = {
    getConfig
};
