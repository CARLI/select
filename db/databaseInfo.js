var config = require('../config');

module.exports = {
    local: {
        baseUrl: config.storeOptions.privilegedCouchDbUrl,
        publicBaseUrl: config.storeOptions.couchDbUrl,
        mainDbName: config.storeOptions.couchDbName,
        mainDbUrl: config.storeOptions.privilegedCouchDbUrl + '/' + config.storeOptions.couchDbName
    },
    dev: {
        baseUrl: 'http://admin:password@select-devel.carli.illinois.edu/db',
        publicBaseUrl: 'http://select-devel.carli.illinois.edu/db/',
        mainDbName: 'carli',
        mainDbUrl: 'http://admin:password@select-devel.carli.illinois.edu/db/carli'
    },
    test: {
        baseUrl: 'http://admin:password@select-test.carli.illinois.edu/db',
        publicBaseUrl: 'http://select-test.carli.illinois.edu/db/',
        mainDbName: 'carli',
        mainDbUrl: 'http://admin:password@select-test.carli.illinois.edu/db/carli'
    },
    prod: {
        baseUrl: 'http://select-prod.carli.illinois.edu/db',
        publicBaseUrl: 'http://select-prod.carli.illinois.edu/db/carli',
        mainDbName: 'carli',
        mainDbUrl: 'http://select-prod.carli.illinois.edu/db/carli'
    }
};
