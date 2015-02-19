var config = require('./default.js')
    , dbCredentials = require('./db_credentials.js');

module.exports = function () {
    return mergeDbCredentials(config, dbCredentials);

    function mergeDbCredentials(config, dbCredentials) {
        for (var attr in dbCredentials) {
            config.idalDsn[attr] = dbCredentials[attr];
            config.crmDsn[attr] = dbCredentials[attr];
        }
        return config;
    }
}();
