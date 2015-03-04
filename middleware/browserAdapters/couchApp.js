var middlewareRequest = require('./middlewareRequest');

function putDesignDoc(dbName) {
    return middlewareRequest({
        path: '/design-doc/' + dbName,
        method: 'put'
    });
}

module.exports = {
    putDesignDoc: putDesignDoc
};
