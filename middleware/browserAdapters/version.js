
const middlewareRequest = require('./middlewareRequest');

function getVersion() {
    return middlewareRequest({
        path: '/version',
        method: 'get'
    }).then(response => response.result);
}

module.exports = {
    getVersion
};
