const config = require('../../config');
const Q = require('q');

function getConfig(key) {
    var deferred = Q.defer();

    deferred.resolve( config.isConfigSafeToExposeToWebBrowser(key) ? config.getValue(key) : "" );

    return deferred.promise;
}

module.exports = {
    getConfig: getConfig,
};
