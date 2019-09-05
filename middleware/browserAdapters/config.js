
const middlewareRequest = require('./middlewareRequest');

function getConfig(key) {
    return middlewareRequest({
        path: '/get-config/' + key,
        method: 'get'
    });
}

module.exports = {
    getConfig: getConfig
};
